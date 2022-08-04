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
            Bucket: process.env.VIDEOS_BUCKET_NAME!,
            Key: `videos/${videoInfo.videoDetails.title}-${Date.now()}.mp4`,
            Body: videoStream
        }).promise();

        return getResponseObject(200, { url: result.Location });
    } catch (error: any) {
        return getResponseObject(500, { error: error.message });
    }
}

function getResponseObject(statusCode: number, body: any) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json"  
        },
        body: JSON.stringify(body)
    }; 
}