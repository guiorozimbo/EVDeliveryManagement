using EVDelivery.Customer.Domain.Common;
using EVDelivery.Customer.Domain.ValueObjects;
using FluentAssertions;
using Xunit;
using CustomerEntity = EVDelivery.Customer.Domain.Entities.Customer;

namespace EVDelivery.Customer.Tests.Domain;

public class CustomerDomainTests
{
    [Theory]
    [InlineData("test@example.com")]
    [InlineData("customer.ev@delivery.io")]
    [InlineData("user+tag@domain.com.br")]
    public void EmailAddress_Valid_ShouldCreate(string email)
    {
        // Act
        var emailVo = new EmailAddress(email);

        // Assert
        emailVo.Value.Should().Be(email.ToLowerInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("invalid-email")]
    [InlineData("@nodomain.com")]
    [InlineData("noat.com")]
    public void EmailAddress_Invalid_ShouldThrowDomainException(string email)
    {
        // Act
        var act = () => new EmailAddress(email);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData("+55 11 98765-4321")]
    [InlineData("11987654321")]
    [InlineData("(19) 99876-1234")]
    public void PhoneNumber_Valid_ShouldCreate(string phone)
    {
        // Act
        var phoneVo = new PhoneNumber(phone);

        // Assert
        phoneVo.Value.Should().Be(phone.Trim());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("123")] // Too short
    public void PhoneNumber_Invalid_ShouldThrowDomainException(string phone)
    {
        // Act
        var act = () => new PhoneNumber(phone);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Customer_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        var email = new EmailAddress("carlos@example.com");
        var phone = new PhoneNumber("+55 11 99999-8888");
        var address = new Address("Av. Paulista, 1000", "São Paulo", "SP", "01310-100");

        // Act
        var customer = new CustomerEntity("Carlos Mendes", email, phone, address, "123.456.789-00");

        // Assert
        customer.Name.Should().Be("Carlos Mendes");
        customer.Email.Value.Should().Be("carlos@example.com");
        customer.Address.City.Should().Be("São Paulo");
        customer.DocumentNumber.Should().Be("123.456.789-00");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("A")] // Less than 2 chars
    public void Customer_WithInvalidName_ShouldThrowDomainException(string invalidName)
    {
        // Arrange
        var email = new EmailAddress("carlos@example.com");
        var phone = new PhoneNumber("+55 11 99999-8888");
        var address = new Address("Av. Paulista, 1000", "São Paulo", "SP", "01310-100");

        // Act
        var act = () => new CustomerEntity(invalidName, email, phone, address);

        // Assert
        act.Should().Throw<DomainException>();
    }
}
