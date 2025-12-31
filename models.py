from pydantic import BaseModel
from typing import Dict, Any

class Course(BaseModel):
    id: int
    code: str
    title: str
    credits: int
    instructor: str

class SelectionRequest(BaseModel):
    student_name: str
    course_id: int

class SelectionResponse(BaseModel):
    message: str
    selection: Dict[str, Any]
