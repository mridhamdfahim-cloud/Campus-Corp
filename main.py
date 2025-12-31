from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List
from models import Course, SelectionRequest, SelectionResponse
import json
from pathlib import Path

app = FastAPI(title="BRACU Course Selector")

# Serve static files and templates
BASE = Path(__file__).parent
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")
templates = Jinja2Templates(directory=BASE / "templates")

COURSES_FILE = BASE / "courses.json"
SELECTIONS_FILE = BASE / "selections.json"
PROGRAMS_FILE = BASE / "programs.json"
APPLICATIONS_FILE = BASE / "applications.json"

def load_courses():
	if not COURSES_FILE.exists():
		return []
	with COURSES_FILE.open("r", encoding="utf-8") as f:
		return json.load(f)


def load_programs():
	if not PROGRAMS_FILE.exists():
		return []
	with PROGRAMS_FILE.open("r", encoding="utf-8") as f:
		return json.load(f)


@app.get("/programs")
def programs_list():
	return load_programs()


@app.get("/programs/{program_id}")
def program_detail(program_id: int):
	progs = load_programs()
	for p in progs:
		if p.get("id") == program_id:
			return p
	raise HTTPException(status_code=404, detail="Program not found")


@app.post("/apply")
def apply_program(payload: dict):
	# payload expected: {"program_id": int, "name": str, "email": str, "message": str}
	apps = []
	if APPLICATIONS_FILE.exists():
		try:
			with APPLICATIONS_FILE.open("r", encoding="utf-8") as f:
				apps = json.load(f)
		except json.JSONDecodeError:
			apps = []
	apps.append(payload)
	with APPLICATIONS_FILE.open("w", encoding="utf-8") as f:
		json.dump(apps, f, indent=2)
	return {"message": "Application received", "application": payload}


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
	return templates.TemplateResponse("index.html", {"request": request})

@app.get("/courses", response_model=List[Course])
def list_courses():
	return load_courses()

@app.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: int):
	courses = load_courses()
	for c in courses:
		if c["id"] == course_id:
			return c
	raise HTTPException(status_code=404, detail="Course not found")

@app.post("/select", response_model=SelectionResponse)
def select_course(payload: SelectionRequest):
	courses = load_courses()
	if not any(c["id"] == payload.course_id for c in courses):
		raise HTTPException(status_code=404, detail="Course not found")
	selections = []
	if SELECTIONS_FILE.exists():
		try:
			with SELECTIONS_FILE.open("r", encoding="utf-8") as f:
				selections = json.load(f)
		except json.JSONDecodeError:
			selections = []
	entry = {"student_name": payload.student_name, "course_id": payload.course_id}
	selections.append(entry)
	with SELECTIONS_FILE.open("w", encoding="utf-8") as f:
		json.dump(selections, f, indent=2)
	return SelectionResponse(message="Course selected", selection=entry)
