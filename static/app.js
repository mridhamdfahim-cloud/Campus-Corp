async function fetchCourses() {
  const res = await fetch('/courses');
  const courses = await res.json();
  const container = document.getElementById('courses');
  if (!courses.length) {
    container.innerHTML = '<p>No courses available.</p>';
    return;
  }
  const list = document.createElement('ul');
  for (const c of courses) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${c.code}</strong> — ${c.title} (${c.credits} cr) — ${c.instructor} `;
    const btn = document.createElement('button');
    btn.textContent = 'Select';
    btn.onclick = () => selectCourse(c.id);
    li.appendChild(btn);
    list.appendChild(li);
  }
  container.innerHTML = '';
  container.appendChild(list);
}

async function selectCourse(courseId) {
  const name = prompt('Your name to register for this course:');
  if (!name) return;
  const res = await fetch('/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_name: name, course_id: courseId })
  });
  const msg = document.getElementById('message');
  if (res.ok) {
    const body = await res.json();
    msg.textContent = body.message + ' — ' + JSON.stringify(body.selection);
    msg.className = 'message success';
  } else {
    const err = await res.json();
    msg.textContent = err.detail || 'Error selecting course';
    msg.className = 'message error';
  }
}

window.addEventListener('load', fetchCourses);
