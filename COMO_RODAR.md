# Como Executar o EV Delivery Management Platform

Este guia explica como rodar todos os serviços do projeto de forma simples e rápida no Windows.

---

## 📋 Pré-requisitos

1. **Docker Desktop**: Deve estar instalado e aberto (ícone do Docker rodando na barra de tarefas do Windows).
2. **.NET 10 SDK**: Já instalado na sua máquina (`10.0.401`).
3. **Node.js e npm**: Já instalados na sua máquina (`Node v24.14.1` / `npm 11.14.1`).

---

## ⚡ Passo 1: Subir o Banco de Dados (PostgreSQL)

Abra o PowerShell na raiz do projeto (`D:\source\repos\EVDeliveryManagement`) e execute:

```powershell
docker compose up -d
```

> **O que isso faz:**
> Sobe 1 container leve do PostgreSQL 16 na porta `5432`.
> Cria automaticamente os 3 bancos de dados isolados:
> - `ev_vehicle_db`
> - `ev_customer_db`
> - `ev_delivery_db`

Para verificar se o container está rodando:
```powershell
docker ps
```

---

## ⚡ Passo 2: Iniciar os Microsserviços e o Gateway

Você pode iniciar cada serviço abrindo um terminal separado para cada um, ou executar o script auxiliar:

### Opção A: Executar via Script PowerShell Automático

Execute o script que abre cada serviço em sua própria janela:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-all.ps1
```

### Opção B: Abrir manualmente em terminais separados

**Terminal 1 — Vehicle Service (Porta 5001):**
```powershell
cd D:\source\repos\EVDeliveryManagement
dotnet run --project src/Services/Vehicle/EVDelivery.Vehicle.API
```

**Terminal 2 — Customer Service (Porta 5002):**
```powershell
cd D:\source\repos\EVDeliveryManagement
dotnet run --project src/Services/Customer/EVDelivery.Customer.API
```

**Terminal 3 — Delivery Service (Porta 5003):**
```powershell
cd D:\source\repos\EVDeliveryManagement
dotnet run --project src/Services/Delivery/EVDelivery.Delivery.API
```

**Terminal 4 — YARP API Gateway (Porta 5000):**
```powershell
cd D:\source\repos\EVDeliveryManagement
dotnet run --project src/Gateway/EVDelivery.Gateway
```

---

## ⚡ Passo 3: Iniciar o Frontend React

No quinto terminal, inicie a aplicação web:

```powershell
cd D:\source\repos\EVDeliveryManagement\frontend\ev-delivery-web
npm run dev
```

Abra seu navegador em:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Credenciais para Demonstração (Login)

Na tela de login, você pode clicar nos botões de preenchimento rápido ou digitar:

| Perfil | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@evdelivery.com` | `Admin@123!` |
| **Técnico / PDI** | `tech@evdelivery.com` | `Tech@123!` |
| **Consultor de Entrega** | `sales@evdelivery.com` | `Sales@123!` |

---

## 🧪 Como Rodar os Testes Automatizados

Para rodar todos os **52 testes automatizados** da solução:

```powershell
cd D:\source\repos\EVDeliveryManagement
dotnet test EVDeliveryManagement.sln
```

Resultado esperado:
```
Aprovado! – Com falha: 0, Aprovado: 11 (Delivery)
Aprovado! – Com falha: 0, Aprovado: 21 (Customer)
Aprovado! – Com falha: 0, Aprovado: 20 (Vehicle)
Total: 52 testes aprovados com 100% de sucesso.
```

---

## 🌐 URLs dos Serviços

- **Frontend Web**: http://localhost:5173
- **YARP API Gateway**: http://localhost:5000/swagger
- **Vehicle Service**: http://localhost:5001/swagger
- **Customer Service**: http://localhost:5002/swagger
- **Delivery Service**: http://localhost:5003/swagger
