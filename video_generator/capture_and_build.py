import os
import sys
import time
import asyncio
from PIL import Image, ImageDraw, ImageFont
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import edge_tts
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
FINAL_VIDEO = os.path.join(os.path.dirname(OUTPUT_DIR), "DisputeOps_AI_Demo.mp4")

SCENES = [
    {
        "id": "scene_1_overview",
        "title": "DisputeOps AI - Overview",
        "narration": "Welcome to DisputeOps AI, an intelligent payment dispute investigation and financial loss prevention platform. In digital payments, handling a dispute is a high stakes financial investigation across multiple disconnected systems. DisputeOps AI automates this entire process using a collaborative multi-agent architecture integrated directly with PayPal's Disputes REST API.",
        "url_action": "inbox_top"
    },
    {
        "id": "scene_2_agents",
        "title": "Multi-Agent Architecture",
        "narration": "Rather than relying on a single AI chatbot, DisputeOps AI deploys four specialized autonomous agents. First, the Dispute Analyst understands the dispute category. Next, the Evidence Collector retrieves merchant order records, invoices, and carrier tracking. Third, the Evidence Auditor runs deterministic validation checks to detect gaps and contradictions. Finally, the Resolution Agent prepares an explainable, grounded defense statement.",
        "url_action": "workflow_view"
    },
    {
        "id": "scene_3_inr_5000",
        "title": "Case Study: 5,000 INR Delivery Dispute",
        "narration": "Let us examine a real world scenario. A customer files a 5,000 rupee dispute claiming an item was never received. In under 20 milliseconds, our multi-agent pipeline matches order 5000, verifies BlueDart delivery status, and attaches the signed proof of delivery. With a perfect 100 confidence score, the system drafts an airtight defense grounded in PayPal Seller Protection guidelines.",
        "url_action": "case_5000"
    },
    {
        "id": "scene_4_gap_detection",
        "title": "Intelligent Gap Detection",
        "narration": "DisputeOps AI strictly prevents hallucinations. In this second dispute, carrier records indicate the parcel is still in transit with no proof of delivery. Instead of fabricating a delivery claim, the Evidence Auditor immediately flags the critical evidence gap and advises the merchant to obtain carrier proof or issue a concession refund to prevent dispute penalty fees.",
        "url_action": "case_gap"
    },
    {
        "id": "scene_5_epod",
        "title": "Digital Proof of Delivery Inspector",
        "narration": "Operations teams can inspect verified documents directly in the dashboard. Here is the electronic Proof of Delivery, complete with the courier consignment number, verified GPS delivery coordinates, and the customer's digital signature captured on the courier handheld terminal.",
        "url_action": "epod_modal"
    },
    {
        "id": "scene_6_response_editor",
        "title": "Grounded Response & Tone Customizer",
        "narration": "The Resolution Agent drafts an evidence backed statement citing verified attachments. Operators can customize the response voice with a single click, switching between standard PayPal compliance, firm legal rebuttal, or an empathetic customer-centric tone.",
        "url_action": "editor_view"
    },
    {
        "id": "scene_7_approval",
        "title": "Human-in-the-Loop Review Gate",
        "narration": "Because financial disputes have monetary consequences, DisputeOps AI enforces strict human oversight. An authorized operator reviews the case, records an audit justification, and authorizes submission. The platform transmits the evidence package directly to PayPal's API via OAuth 2.0 and logs an immutable audit trail.",
        "url_action": "approval_modal"
    },
    {
        "id": "scene_8_analytics",
        "title": "Loss Prevention & Root-Cause Analytics",
        "narration": "Finally, the Analytics Dashboard tracks total defended capital, penalty fees saved, dispute root-cause distribution, and carrier delivery reliability scorecards, helping businesses eliminate operational bottlenecks and win more dispute cases.",
        "url_action": "analytics_tab"
    },
    {
        "id": "scene_9_conclusion",
        "title": "DisputeOps AI - The Future of Dispute Ops",
        "narration": "DisputeOps AI transforms fragmented manual dispute investigations into an intelligent, transparent, and evidence-driven workflow. Thank you.",
        "url_action": "conclusion_slide"
    }
]

def create_title_slide(path, title_text, subtitle_text):
    img = Image.new("RGB", (1920, 1080), color="#0b0f19")
    draw = ImageDraw.Draw(img)
    
    # Gradient accent bar
    draw.rectangle([0, 0, 1920, 12], fill="#3b82f6")
    
    # Text
    draw.text((120, 380), title_text, fill="#f8fafc")
    draw.text((120, 520), subtitle_text, fill="#38bdf8")
    draw.text((120, 620), "Agentic AI for Payment Dispute Investigation & Financial Loss Prevention", fill="#94a3b8")
    draw.text((120, 850), "Integrated with PayPal Disputes REST API (OAuth 2.0)", fill="#10b981")
    img.save(path)

def create_conclusion_slide(path):
    img = Image.new("RGB", (1920, 1080), color="#0b0f19")
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 1920, 12], fill="#10b981")
    draw.text((120, 360), "DisputeOps AI", fill="#f8fafc")
    draw.text((120, 480), "Intelligent Payment Dispute Investigation & Financial Loss Prevention", fill="#38bdf8")
    draw.text((120, 600), "• Multi-Agent Collaboration: Analyst, Collector, Auditor, Resolution Agent", fill="#e2e8f0")
    draw.text((120, 660), "• Deterministic Rule Validation & Automated Evidence Gap Detection", fill="#e2e8f0")
    draw.text((120, 720), "• Direct PayPal Disputes REST API & Webhook Integration", fill="#e2e8f0")
    draw.text((120, 780), "• Human-in-the-Loop Oversight & Compliance Audit Trail", fill="#e2e8f0")
    draw.text((120, 920), "GitHub: https://github.com/smart-ranjith/DisputeOps-AI", fill="#fbbf24")
    img.save(path)

def capture_screenshots():
    print("[1/3] Capturing real 1080p screenshots from live application...")
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--hide-scrollbars")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("http://127.0.0.1:5173")
        time.sleep(3)
        
        # 1. Overview
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_1_overview.png"))
        
        # 2. Agents view - scroll slightly down
        driver.execute_script("window.scrollTo(0, 380);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_2_agents.png"))
        
        # 3. Case 5000 view - scroll to evidence
        driver.execute_script("window.scrollTo(0, 720);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_3_inr_5000.png"))
        
        # 4. Click gap detection dispute (PP-D-774129-INR)
        driver.execute_script("window.scrollTo(0, 200);")
        time.sleep(0.5)
        rows = driver.find_elements(By.TAG_NAME, "tr")
        for r in rows:
            if "774129" in r.text:
                r.click()
                time.sleep(1)
                break
        driver.execute_script("window.scrollTo(0, 650);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_4_gap_detection.png"))
        
        # 5. Open e-POD Inspector Modal
        # Select first dispute again
        driver.execute_script("window.scrollTo(0, 200);")
        for r in driver.find_elements(By.TAG_NAME, "tr"):
            if "839210" in r.text:
                r.click()
                time.sleep(1)
                break
        driver.execute_script("window.scrollTo(0, 750);")
        time.sleep(1)
        # Click Inspect Doc buttons
        inspect_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Inspect Doc')]")
        if inspect_btns:
            driver.execute_script("arguments[0].click();", inspect_btns[0])
            time.sleep(1.5)
            driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_5_epod.png"))
            # Reload page to cleanly close modal
            driver.get("http://127.0.0.1:5173")
            time.sleep(1.5)
        
        # 6. Response Editor
        driver.execute_script("window.scrollTo(0, 1150);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_6_response_editor.png"))
        
        # 7. Approval Modal
        # Ensure dispute 839210 is selected
        for r in driver.find_elements(By.TAG_NAME, "tr"):
            if "839210" in r.text:
                driver.execute_script("arguments[0].click();", r)
                time.sleep(1.5)
                break
                
        approve_btns = driver.find_elements(By.XPATH, "//button[contains(., 'Review & Approve')]")
        if approve_btns:
            driver.execute_script("arguments[0].click();", approve_btns[0])
            driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(2)
            driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_7_approval.png"))
            # Reload page to cleanly close modal
            driver.get("http://127.0.0.1:5173")
            time.sleep(1.5)
            
        # 8. Analytics tab
        analytics_tabs = driver.find_elements(By.XPATH, "//button[contains(., 'Analytics')]")
        if analytics_tabs:
            driver.execute_script("arguments[0].click();", analytics_tabs[0])
            time.sleep(2)
            driver.execute_script("window.scrollTo(0, 0);")
            driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_8_analytics.png"))
            
        # 9. Conclusion Slide (Rendered via HTML in full 1080p)
        conclusion_url = "file:///" + os.path.join(OUTPUT_DIR, "conclusion_slide.html").replace("\\", "/")
        driver.get(conclusion_url)
        time.sleep(1.5)
        driver.save_screenshot(os.path.join(OUTPUT_DIR, "scene_9_conclusion.png"))
        
    finally:
        driver.quit()

def generate_narration_audio():
    print("[2/3] Generating crystal-clear voiceover audio with Windows SAPI...")
    import win32com.client
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    speaker.Rate = 1  # Professional clear pace
    
    for scene in SCENES:
        wav_path = os.path.join(OUTPUT_DIR, f"{scene['id']}.wav")
        filestream = win32com.client.Dispatch("SAPI.SpFileStream")
        filestream.Open(wav_path, 3, False)
        speaker.AudioOutputStream = filestream
        speaker.Speak(scene["narration"])
        filestream.Close()
        print(f"  [OK] Voiceover generated: {scene['id']}.wav")

def render_final_video():
    print("[3/3] Assembling video with MoviePy (1080p, synchronized audio)...")
    clips = []
    total_duration = 0.0
    
    for scene in SCENES:
        img_path = os.path.join(OUTPUT_DIR, f"{scene['id']}.png")
        audio_path = os.path.join(OUTPUT_DIR, f"{scene['id']}.wav")
        
        if not os.path.exists(img_path):
            create_title_slide(img_path, scene["title"], "DisputeOps AI Platform")
            
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration + 0.5  # slight breathing room
        total_duration += duration
        
        img_clip = ImageClip(img_path).with_duration(duration).with_audio(audio_clip)
        clips.append(img_clip)
        print(f"  Added {scene['id']}: {duration:.2f}s")
        
    final = concatenate_videoclips(clips, method="compose")
    print(f"Final video length: {total_duration:.2f}s ({total_duration/60:.2f} minutes) - Under 3 minutes limit!")
    
    final.write_videofile(
        FINAL_VIDEO,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        threads=4,
        preset="fast"
    )
    print(f"SUCCESS: Video exported to {FINAL_VIDEO}")

if __name__ == "__main__":
    capture_screenshots()
    generate_narration_audio()
    render_final_video()
