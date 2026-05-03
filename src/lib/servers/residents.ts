import "server-only";

import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { documentClient, tableName } from "@/lib/dynamodb";
import { fromDynamoItem, residentKey, toResidentItem, type DynamoItem } from "@/lib/dynamodb-items";
import type { Resident, ResidentStatus, ResidentUpsert } from "@/types/domain";

export async function getResidents(filters?: { q?: string; status?: ResidentStatus }) {
  const search = filters?.q?.trim().toLowerCase();
  const residents = await scanResidents();

  return residents
    .filter((resident) => {
      const matchesStatus = filters?.status ? resident.status === filters.status : true;
      const matchesSearch = search ? resident.name.toLowerCase().includes(search) : true;

      return matchesStatus && matchesSearch;
    })
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR", { sensitivity: "base" }));
}

export async function putResident(resident: ResidentUpsert) {
  const persistedResident: Resident = {
    ...resident,
    id: resident.id ?? crypto.randomUUID()
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: toResidentItem(persistedResident)
    })
  );

  return persistedResident;
}

export async function deleteResident(id: string) {
  await documentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        PK: residentKey(id),
        SK: "PROFILE"
      }
    })
  );

  return { id };
}

export async function getResidentById(id: string) {
  const response = await documentClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        PK: residentKey(id),
        SK: "PROFILE"
      }
    })
  );

  return response.Item ? fromDynamoItem(response.Item as DynamoItem<Resident>) : null;
}

export async function getResidentByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const residents = await scanResidents();

  return (
    residents.find((resident) => resident.email?.trim().toLowerCase() === normalizedEmail) ?? null
  );
}

async function scanResidents() {
  const residents: Resident[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
        FilterExpression: "#entityType = :entityType",
        ExpressionAttributeNames: {
          "#entityType": "entityType"
        },
        ExpressionAttributeValues: {
          ":entityType": "Resident"
        }
      })
    );

    residents.push(...(response.Items ?? []).map((item) => fromDynamoItem(item as DynamoItem<Resident>)));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return residents;
}
