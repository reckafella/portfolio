from pytube.download_helper import download_video

# Provide the YouTube video URL
video_url = "https://youtu.be/SbJAv0jfL4Q?si=oA5j19ytAvDNBLFa"

# Create a YouTube object
try:
    yt = download_video(video_url)
except Exception as e:
    print(f"Error creating YouTube object: {e}")
    exit(1)

print("Download completed!")
