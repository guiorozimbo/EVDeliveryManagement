using System.Net;
using System.Text.Json;
using EVDelivery.Vehicle.Domain.Common;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EVDelivery.Vehicle.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? context.TraceIdentifier;
        _logger.LogError(exception, "Unhandled exception occurred during request. CorrelationId: {CorrelationId}", correlationId);

        var (status, title, detail, extensions) = exception switch
        {
            ValidationException valEx => (
                HttpStatusCode.UnprocessableEntity,
                "Validation Error",
                "One or more validation errors occurred.",
                valEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => (object)g.Select(e => e.ErrorMessage).ToArray())),

            DomainException domEx => (
                HttpStatusCode.Conflict,
                "Domain Rule Violation",
                domEx.Message,
                null),

            KeyNotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                "Resource Not Found",
                notFoundEx.Message,
                null),

            UnauthorizedAccessException unauthEx => (
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                unauthEx.Message,
                null),

            _ => (
                HttpStatusCode.InternalServerError,
                "Internal Server Error",
                "An unexpected internal error occurred on the server.",
                null)
        };

        var problemDetails = new ProblemDetails
        {
            Status = (int)status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problemDetails.Extensions["correlationId"] = correlationId;

        if (extensions != null)
        {
            problemDetails.Extensions["errors"] = extensions;
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)status;

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, options));
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseCentralizedExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
