const form = document.getElementById("contactForm");
const statusEl = document.getElementById("status");
const replyToField = document.getElementById("replyToField");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusEl.textContent = "Sending...";
    const formData = new FormData(form);

    // Ensure Reply-To is the user's email (Formspree uses it on paid plans; still useful metadata)
    const email = formData.get("email");
    if (replyToField && email) replyToField.value = String(email);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "Message sent. I’ll get back to you soon.";
      } else {
        statusEl.textContent = "Something went wrong. Please try again, or email me directly.";
      }
    } catch {
      statusEl.textContent = "Network error. Please try again, or email me directly.";
    }
  });
}
