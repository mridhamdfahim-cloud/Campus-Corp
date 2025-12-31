from fastapi import FastAPI, HTTPException
from typing import List
from models import Course, SelectionRequest, SelectionResponse
import json
from pathlib import Path

app = FastAPI(title="BRACU Course Selector")

BASE = Path(__file__).parent
COURSES_FILE = BASE / "courses.json"
SELECTIONS_FILE = BASE / "selections.json"

def load_courses():
	if not COURSES_FILE.exists():
		return []
	with COURSES_FILE.open("r", encoding="utf-8") as f:
		return json.load(f)

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
