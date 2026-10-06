using EVDelivery.Customer.Application.DTOs;
using EVDelivery.Customer.Application.Validators;
using FluentAssertions;
using Xunit;

namespace EVDelivery.Customer.Tests.Application;

public class CustomerValidationTests
{
    private readonly CreateCustomerRequestValidator _validator = new();

    [Fact]
    public void ValidCustomerRequest_ShouldPassValidation()
    {
        // Arrange
        var request = new CreateCustomerRequest(
            Name: "Carlos Mendes",
            Email: "carlos.mendes@example.com",
            Phone: "+55 11 98765-4321",
            Street: "Av. Paulista, 1000",
            City: "São Paulo",
            State: "SP",
            PostalCode: "01310-100"
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void MissingEmail_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateCustomerRequest(
            Name: "Carlos Mendes",
            Email: "",
            Phone: "+55 11 98765-4321",
            Street: "Av. Paulista, 1000",
            City: "São Paulo",
            State: "SP",
            PostalCode: "01310-100"
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public void InvalidPhone_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateCustomerRequest(
            Name: "Carlos Mendes",
            Email: "carlos@example.com",
            Phone: "123",
            Street: "Av. Paulista, 1000",
            City: "São Paulo",
            State: "SP",
            PostalCode: "01310-100"
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Phone");
    }
}
