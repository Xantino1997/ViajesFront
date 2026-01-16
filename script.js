document.getElementById('busForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Obtener los valores del formulario
    const numPassengers = document.getElementById('numPassengers').value;
    const price = document.getElementById('price').value;
    const responsible = document.getElementById('responsible').value;
  
    // Validación de campos obligatorios
    if (!numPassengers || !price || !responsible) {
      alert('Todos los campos son obligatorios.');
      return;
    }
  
    // Guardar datos en el almacenamiento local (localStorage) para ser accesibles en el siguiente HTML
    localStorage.setItem('numPassengers', numPassengers);
    localStorage.setItem('price', price);
    localStorage.setItem('responsible', responsible);
  
    // Redirigir a la página con el formulario de pasajeros
    window.location.href = 'busDetails.html';
  });

  
