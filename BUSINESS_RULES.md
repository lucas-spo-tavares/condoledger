# CondoLedger Business Rules

Este documento consolida as regras de negocio definidas para o CondoLedger.

## Contexto

CondoLedger e um sistema web para gestao de contribuicoes mensais de um condominio, incluindo moradores, lojas, igrejas e apartamentos que contribuem com despesas comuns.

O posicionamento do produto deve ser de gestao de condominio ou rateio condominial. O sistema nao deve ser apresentado como ferramenta de cobranca obrigatoria de associacao de moradores sem base juridica definida.

## Tipos de Usuario

O sistema possui dois perfis principais:

- Admin: pessoa responsavel por cadastrar contribuintes, registrar pagamentos, anexar comprovantes, lancar despesas e gerar relatorios.
- Morador/contribuinte: pessoa ou entidade que acessa apenas os proprios dados e historico de pagamentos.

O acesso deve ser feito por OTP, sem senha tradicional.

## Tipos de Contribuinte

O cadastro tratado inicialmente como "morador" deve suportar diferentes tipos de contribuinte:

- Morador
- Loja
- Igreja
- Apartamento/edificio

Cada contribuinte deve possuir pelo menos:

- Nome
- E-mail
- Unidade ou identificador
- Tipo
- Valor mensal de contribuicao
- Status

O valor mensal de contribuicao pode variar por contribuinte. Alguns moradores, lojas, igrejas ou apartamentos podem pagar mais ou menos do que outros.

O total previsto de receitas do mes deve considerar a soma dos valores mensais dos contribuintes ativos.

## Acesso e Permissoes

Admins podem:

- Ver todos os contribuintes
- Cadastrar e editar contribuintes
- Registrar pagamentos manualmente
- Anexar comprovantes
- Lancar despesas
- Gerar relatorios mensais

Contribuintes podem:

- Acessar via OTP
- Ver apenas os proprios dados
- Ver apenas os proprios pagamentos
- Ver o proprio historico mensal

Contribuintes nao devem conseguir ver dados privados de outros contribuintes.

## Pagamentos

Pagamentos sao registrados manualmente pelo admin.

O fluxo atual esperado e:

1. O contribuinte faz o pagamento fora do sistema.
2. O contribuinte envia uma mensagem ou comprovante por WhatsApp para o admin.
3. O admin entra no CondoLedger.
4. O admin registra que o pagamento foi realizado.
5. O admin pode anexar o comprovante ao registro.

O sistema nao confirma automaticamente se o dinheiro caiu na conta.

Status iniciais de pagamento:

- Pendente
- Confirmado
- Cancelado

## Comprovantes

O admin deve poder anexar comprovantes ao registrar ou editar um pagamento.

Formatos esperados:

- Imagem
- PDF

Os comprovantes devem ser armazenados fora do DynamoDB. A infraestrutura inicial preve um bucket S3 privado para esse uso.

## Pix

O sistema pode oferecer Pix como facilidade para pagamento.

Regras:

- Pix deve ser opcional.
- Pix deve ser configuravel.
- O sistema pode exibir QR Code ou copia-e-cola.
- O sistema nao deve assumir integracao bancaria.
- Mesmo com Pix configurado, a confirmacao do pagamento continua manual.

## Despesas

O admin deve poder lancar despesas mensais do condominio.

Cada despesa deve possuir pelo menos:

- Mes de referencia
- Categoria
- Descricao
- Valor
- Data de pagamento

Exemplos de categorias:

- Seguranca
- Manutencao
- Cameras
- Servicos

## Relatorio Mensal

O sistema deve gerar um relatorio mensal em PDF.

O relatorio deve conter inicialmente:

- Mes de referencia
- Total previsto de receitas
- Total recebido
- Total de despesas
- Saldo do mes
- Pagamentos confirmados
- Pagamentos pendentes
- Despesas lancadas

O relatorio mensal e diferente de um recibo individual. O foco inicial e o relatorio mensal com gastos do condominio.

## Portal do Contribuinte

O portal do contribuinte deve ser limitado aos proprios dados.

O contribuinte deve conseguir visualizar:

- Dados cadastrais proprios
- Pagamentos proprios
- Status dos pagamentos
- Historico mensal proprio

A exibicao do relatorio completo do condominio ainda precisa ser decidida.

## Interface

A interface do usuario final deve ser em portugues, pois a usuaria admin principal nao fala ingles.

O codigo, nomes de arquivos, tipos, funcoes, variaveis e arquitetura devem permanecer em ingles para manter qualidade de portfolio.

## Arquitetura

O fluxo de dados no frontend/backend deve seguir:

```text
UI -> lib/hooks -> lib/apis -> app/api routes -> lib/servers -> banco/servicos externos
```

Regras arquiteturais:

- `page.tsx` e `layout.tsx` nao devem conter `"use client"`.
- Componentes que precisam de hooks client devem ficar em templates ou componentes client especificos.
- Hooks TanStack devem ficar em `src/lib/hooks/<domain>`.
- Clients HTTP devem ficar em `src/lib/apis`.
- Comunicacao com banco e servicos externos deve ficar em `src/lib/servers`.
- Arquivos em `src/lib/servers` devem importar `server-only` no topo do arquivo.
- Helpers compartilhados devem ficar em `src/lib/commons`.

## Infraestrutura

Stack definida:

- Next.js
- Tailwind CSS
- shadcn/ui
- TanStack Query
- DynamoDB
- Amazon DynamoDB Local via Docker Compose
- Cognito com OTP
- Terraform
- S3 privado para comprovantes

Terraform nao le `.env.local` automaticamente. Variaveis de Terraform devem ser passadas via defaults, `TF_VAR_*`, `*.tfvars` ou ambiente apropriado.
