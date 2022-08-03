import AWS from "aws-sdk";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import ytdl from "ytdl-core";

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body!);
    const videoUrl = body.url;
    try {
        const videoInfo = await ytdl.getBasicInfo(videoUrl);
        const videoStream = await ytdl(videoUrl);

        const s3Client = new AWS.S3();

        const result = await s3Client.upload({
            Bucket: "youtube-video-downloader-dev-videosbucket-1byvd72tee8vq",
            Key: `${videoInfo.videoDetails.title}.mp4`,
            Body: videoStream
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                url: result.Location
            })
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };  
    }
}
