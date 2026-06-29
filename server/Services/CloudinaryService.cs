using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService()
    {
        var account = new Account(
            Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
            Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY"),
            Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
{
    Console.WriteLine($"File received: {file?.FileName}, Size: {file?.Length}, ContentType: {file?.ContentType}");
    
    if (file == null || file.Length == 0)
        throw new Exception("File is null or empty before upload");

    using var stream = new MemoryStream();
    await file.CopyToAsync(stream);
    stream.Position = 0;

    Console.WriteLine($"Stream length after copy: {stream.Length}");

    var uploadParams = new ImageUploadParams
    {
        File = new FileDescription(file.FileName, stream),
        Folder = "notely",
        Transformation = new Transformation()
            .Width(200).Height(200).Crop("fill").Gravity("face")
    };

    var result = await _cloudinary.UploadAsync(uploadParams);

    Console.WriteLine($"Cloudinary result error: {result.Error?.Message ?? "none"}");

    if (result.Error != null)
        throw new Exception(result.Error.Message);

    return result.SecureUrl.ToString();
}
}