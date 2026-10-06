using EVDelivery.Customer.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CustomerEntity = EVDelivery.Customer.Domain.Entities.Customer;

namespace EVDelivery.Customer.Infrastructure.Persistence;

public static class CustomerDbSeeder
{
    // Well-known static IDs so delivery seed can associate them deterministically
    public static readonly Guid Customer1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid Customer2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid Customer3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid Customer4Id = Guid.Parse("44444444-4444-4444-4444-444444444444");

    public static async Task SeedAsync(CustomerDbContext context, ILogger logger)
    {
        try
        {
            if (await context.Customers.AnyAsync())
            {
                logger.LogInformation("Customer database already seeded. Skipping.");
                return;
            }

            logger.LogInformation("Seeding initial demonstration customers...");

            var customer1 = new CustomerEntity(
                "Carlos Eduardo Mendes",
                new EmailAddress("carlos.mendes@example.com"),
                new PhoneNumber("+55 11 98765-4321"),
                new Address("Av. Brigadeiro Faria Lima, 2200", "São Paulo", "SP", "01452-000"),
                "123.456.789-00"
            );
            typeof(CustomerEntity).GetProperty("Id")?.SetValue(customer1, Customer1Id);

            var customer2 = new CustomerEntity(
                "Juliana Almeida Ramos",
                new EmailAddress("juliana.ramos@example.com"),
                new PhoneNumber("+55 19 97654-3210"),
                new Address("Rua Coronel Quirino, 850", "Campinas", "SP", "13025-001"),
                "234.567.890-11"
            );
            typeof(CustomerEntity).GetProperty("Id")?.SetValue(customer2, Customer2Id);

            var customer3 = new CustomerEntity(
                "Rodrigo Silveira Castro",
                new EmailAddress("rodrigo.castro@example.com"),
                new PhoneNumber("+55 41 99123-4567"),
                new Address("Rua XV de Novembro, 1200", "Curitiba", "PR", "80020-310"),
                "345.678.901-22"
            );
            typeof(CustomerEntity).GetProperty("Id")?.SetValue(customer3, Customer3Id);

            var customer4 = new CustomerEntity(
                "Fernanda Souza Prado",
                new EmailAddress("fernanda.prado@example.com"),
                new PhoneNumber("+55 21 98234-5678"),
                new Address("Av. Atlântica, 1500", "Rio de Janeiro", "RJ", "22021-001"),
                "456.789.012-33"
            );
            typeof(CustomerEntity).GetProperty("Id")?.SetValue(customer4, Customer4Id);

            await context.Customers.AddRangeAsync(customer1, customer2, customer3, customer4);
            await context.SaveChangesAsync();

            logger.LogInformation("Successfully seeded 4 demonstration customers.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding customer demonstration data.");
        }
    }
}
