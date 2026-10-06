FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
COPY . .
EXPOSE 3000
ENTRYPOINT ["dotnet", "EVDelivery.Gateway.dll"]
