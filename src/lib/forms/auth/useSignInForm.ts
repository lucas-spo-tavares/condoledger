"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  signInEmailDefaultValues,
  signInEmailSchema,
  signInOtpDefaultValues,
  signInOtpSchema,
  type SignInEmailFormInput,
  type SignInEmailFormValues,
  type SignInOtpFormInput,
  type SignInOtpFormValues
} from "@/lib/schemas/auth/sign-in-schema";

export function useSignInEmailForm() {
  return useForm<SignInEmailFormInput, unknown, SignInEmailFormValues>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: signInEmailDefaultValues
  });
}

export function useSignInOtpForm() {
  return useForm<SignInOtpFormInput, unknown, SignInOtpFormValues>({
    resolver: zodResolver(signInOtpSchema),
    defaultValues: signInOtpDefaultValues
  });
}
