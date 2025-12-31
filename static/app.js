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
      },
      getPrograms: async () => {
        const res = await fetch('/programs');
        if (!res.ok) throw new Error('Failed to load programs');
        return res.json();
      },
      getCourses: async () => {
        const res = await fetch('/courses');
        if (!res.ok) throw new Error('Failed to load courses');
        return res.json();
      }
    };

    function app(){
      return {
        programs: [],
        filteredPrograms: [],
        courses: [],
        selectedProgram: null,
        showApply: false,
        applicant: {name:'', email:'', message:''},
        q: '',
        message: null,
        async init(){
          try{
            this.programs = await window.api.getPrograms();
            this.filteredPrograms = this.programs;
            this.courses = await window.api.getCourses();
          }catch(e){
            console.error(e);
            this.message = 'Failed to load data.';
          }
        },
        filter(){
          const q = this.q.toLowerCase();
          this.filteredPrograms = this.programs.filter(p=> p.title.toLowerCase().includes(q) || (p.code||'').toLowerCase().includes(q));
        },
        selectProgram(p){ this.selectedProgram = p },
        openApply(){ if(!this.selectedProgram){ this.message='Select a program first.'; return } this.showApply=true },
        closeApply(){ this.showApply=false; this.applicant={name:'',email:'',message:''} },
        async submitApplication(){
          const payload = { program_id: this.selectedProgram.id, name: this.applicant.name, email: this.applicant.email, message: this.applicant.message };
          try{
            const res = await window.api.applyProgram(payload);
            this.message = res.message || 'Application submitted.';
            this.closeApply();
          }catch(e){ this.message = 'Failed to submit application.' }
        },
        async selectCourse(courseId){
          const name = prompt('Enter your name to register for this course:');
          if(!name) return;
          try{
            const res = await window.api.selectCourse(courseId, name);
            this.message = res.message || 'Course selected.';
          }catch(e){ this.message = 'Failed to select course.' }
        }
      }
    }
