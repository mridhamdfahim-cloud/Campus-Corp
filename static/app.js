// Frontend helper API used by the Alpine app in index.html
window.api = {
  selectCourse: async (courseId, studentName) => {
    const res = await fetch('/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, course_id: courseId })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({detail:'Unknown error'}));
      throw new Error(err.detail || 'Select failed');
    }
    return res.json();
  },
  applyProgram: async (payload) => {
    const res = await fetch('/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({detail:'Unknown error'}));
      throw new Error(err.detail || 'Apply failed');
    }
    return res.json();
  }
};

