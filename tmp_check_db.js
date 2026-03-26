const URL = "https://tsdzazbarwshgeuplsga.supabase.co/rest/v1/payment_gateways?select=*";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZHphemJhcndzaGdldXBsc2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTEzNDYsImV4cCI6MjA4OTQyNzM0Nn0.b_NqtRjFpjCFdCzDpd_P6Ksu-qd8b1Tf769ctjcNMv4";

async function check() {
  try {
    const response = await fetch(URL, {
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    });
    
    if (response.status === 200) {
      console.log("SUCCESS: Tabela payment_gateways encontrada!");
    } else {
      const error = await response.json();
      console.log(`ERROR: Status ${response.status} - ${error.message || JSON.stringify(error)}`);
    }
  } catch (e) {
    console.log("FAILED: " + e.message);
  }
}

check();
