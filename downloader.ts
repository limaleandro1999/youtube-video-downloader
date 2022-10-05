import AWS from "aws-sdk";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import ytdl, { videoInfo } from "ytdl-core";

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const body = JSON.parse(event.body!);
    const videoUrl = body.url;
    
    try {
        const videoInfo = await ytdl.getBasicInfo(videoUrl);
        const videoStream = await ytdl(videoUrl);
        const result = await uploadVideoToS3(videoInfo, videoStream);

        return getResponseObject(200, { url: result.Location });
    } catch (error: any) {
        return getResponseObject(500, { error: error.message });
    }
}

async function uploadVideoToS3(videoInfo: videoInfo, videoStream: AWS.S3.Body) {
    const s3Client = new AWS.S3();

    return s3Client.upload({
        Bucket: process.env.VIDEOS_BUCKET_NAME!,
        Key: `videos/${videoInfo.videoDetails.title}-${Date.now()}.mp4`,
        Body: videoStream
    }).promise();
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