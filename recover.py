import json
import sys

transcript_path = "/Users/neo/.gemini/antigravity-ide/brain/fec2b21c-4ec4-4cc4-b319-1aea9c70d658/.system_generated/logs/transcript.jsonl"
found_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if "tool_calls" in data:
                pass
            if data.get("source") == "SYSTEM" and "output" in data.get("content", ""):
                content = data["content"]
                if "ScreenManager.swift" in content and "class ScreenManager" in content:
                    found_content = content
        except Exception as e:
            pass

if found_content:
    print("Found it! Length:", len(found_content))
    with open("recovered_screenmanager.txt", "w") as out:
        out.write(found_content)
else:
    print("Not found.")
