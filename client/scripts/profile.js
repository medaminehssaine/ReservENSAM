document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await checkAuth();
  document.getElementById('username').value = currentUser.username;

  // Fetch email from the database
  try {
    const emailResponse = await fetch("http://localhost/ReservENSAM/server/api/get_user_email.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({ user_id: currentUser.user_id })
    });

    const emailData = await emailResponse.json();
    if (emailData.success) {
      document.getElementById('email').value = emailData.email;
    } else {
      alert('Failed to fetch email');
    }
  } catch (error) {
    console.error("Error fetching email:", error);
    alert('Une erreur est survenue lors de la récupération de l\'email.');
  }

  // Add contact_info field for CLUB role
  if (currentUser.role === 'CLUB') {
    const contactInfoResponse = await fetch("http://localhost/ReservENSAM/server/api/get_contact_info.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({ user_id: currentUser.user_id })
    });

    const contactInfoData = await contactInfoResponse.json();
    if (contactInfoData.success) {
      document.getElementById('contact_info').value = contactInfoData.contact_info;
    } else {
      alert('Failed to fetch contact info');
    }
  }

  // Show contact_info field for CLUB role
  if (currentUser.role === 'CLUB') {
    document.getElementById('contact-info-group').style.display = 'block';
  }
});

async function updateProfile() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
  }

  const updateData = { user_id: currentUser.user_id, email, password };

  // Include contact_info for CLUB role
  if (currentUser.role === 'CLUB') {
    const contactInfo = document.getElementById('contact_info').value;
    updateData.contact_info = contactInfo;
  }

  try {
      const response = await fetch("http://localhost/ReservENSAM/server/api/update_profile.php", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
          alert('Profil mis à jour avec succès');
          currentUser.email = email;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error("Error updating profile:", error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
  }
}