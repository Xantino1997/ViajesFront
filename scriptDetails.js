document.addEventListener("DOMContentLoaded", function () {
  // 1. Declaraciones iniciales
  const maxPassengers =
    parseInt(localStorage.getItem("numPassengers"), 10) || 0; // Este valor debe ser usado como la cantidad de pasajeros máxima
  const totalPrice = parseFloat(localStorage.getItem("price")) || 0;
  let coordinator = localStorage.getItem("responsible") || "No disponible";
  let auxiliary = localStorage.getItem("assistant") || "No disponible";
  let destination = localStorage.getItem("destination") || "No disponible"; // Aquí se obtiene del localStorage

  let passengers = [];
  let collectedAmount = 0;

  // Obtener los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const numPassengers = parseInt(urlParams.get("numPassengers")) || 0; // Asegurarse de que sea un número
  const price = urlParams.get("price");
  const responsible = urlParams.get("responsible");
  const assistant = urlParams.get("assistant");
  // Aquí ya no declaras destination, ya está declarada más arriba
  const date = urlParams.get("date");

  // Actualizar destino solo si no tiene valor previo (por si está vacío en localStorage)
  if (
    destination === "No disponible" &&
    urlParams.get("destination") !== null
  ) {
    destination = urlParams.get("destination");
  }

  // Mostrar los valores en los elementos correspondientes
  document.getElementById("totalPrice").textContent = price;
  document.getElementById("numPassengers").textContent = numPassengers;

  // Ajustar lugares ocupados y vacíos basados en el número de pasajeros
  const totalSeats = numPassengers || maxPassengers; // Total de lugares en el colectivo
  const occupiedPlaces = 0; // Inicialmente no hay pasajeros
  const vacantPlaces = totalSeats;

  document.getElementById("occupiedPlaces").textContent = occupiedPlaces;
  document.getElementById("vacantPlaces").textContent = vacantPlaces;

  document.getElementById("destination").textContent = destination;
  document.getElementById("maxPassengerCount").textContent = totalSeats; // Total de lugares disponibles
  document.getElementById("responsible").textContent =
    responsible || coordinator;
  document.getElementById("assistant").textContent = assistant || auxiliary;
  document.getElementById("destinationDisplay").textContent = destination;
  document.getElementById("destinationDisplayHeader").textContent = destination;
  document.getElementById("priceDisplay").textContent = `$${
    price || totalPrice
  }`;

  // Función para cargar los datos desde el backend
  function loadTripData() {
    const tripId = new URLSearchParams(window.location.search).get("id");

    fetch(`https://viajes-roan.vercel.app/viajes/${tripId}`)
        .then((response) => response.json())
        .then((data) => {
            const { numPassengers, price, responsible, assistant, destination, passengers: tripPassengers } = data;

            // Actualizar datos en el DOM
            document.getElementById("totalPrice").textContent = price;
            document.getElementById("numPassengers").textContent = numPassengers;
            document.getElementById("destination").textContent = destination;
            document.getElementById("maxPassengerCount").textContent = numPassengers;
            document.getElementById("responsible").textContent = responsible;
            document.getElementById("assistant").textContent = assistant;
            document.getElementById("destinationDisplay").textContent = destination;
            document.getElementById("risponsableHeader").textContent = responsible;
            document.getElementById("priceDisplay").textContent = `$${price}`;

            // Guardar pasajeros y renderizar en el div
            passengers = tripPassengers;
            renderPassengers();
            updateSeatStatus(); // Si tienes un estado de asientos
        })
        .catch((error) => {
            console.error("Error al cargar los datos del viaje:", error);
            alert("Hubo un error al cargar los datos del viaje.");
        });
}

  // Llamada para cargar los datos del viaje cuando la página esté lista
  loadTripData();

  // Lógica adicional para agregar pasajeros
  document
    .getElementById("addPassengerBtn")
    .addEventListener("click", addPassenger);

  // Configuración de botones para captura de pantalla y descarga de Excel
  document
    .getElementById("captureScreenBtn")
    .addEventListener("click", captureScreen);
  document
    .getElementById("downloadExcelBtn")
    .addEventListener("click", downloadExcel);
  document.getElementById("saveDataBtn").addEventListener("click", saveData);

  // Cargar datos de pasajeros si existen en localStorage
  loadPassengers();

  // Función para cargar pasajeros desde localStorage
  function loadPassengers() {
    const storedPassengers =
      JSON.parse(localStorage.getItem("passengers")) || [];
    passengers = storedPassengers;

    if (passengers.length > 0) {
      renderPassengers();
      updateSeatStatus();
    } else {
      showNoPassengersMessage();
    }
  }

  // Función para mostrar mensaje cuando no hay pasajeros
  function showNoPassengersMessage() {
    const group1 = document.getElementById("group1");
    const group2 = document.getElementById("group2");

    group1.innerHTML = "";
    group2.innerHTML = "";

    const noPassengersMessage = document.createElement("div");
    noPassengersMessage.classList.add("no-passengers-message");
    noPassengersMessage.innerHTML = `
        <p style="text-align: center; color: #007BFF; font-weight: bold; padding: 20px;">
          No hay pasajeros registrados. 
          Utilice el botón "Agregar Pasajero" para comenzar a registrar pasajeros.
        </p>
      `;

    group1.appendChild(noPassengersMessage);
  }

  // 3. Funciones para pasajeros
  function addPassenger() {
    if (passengers.length < totalSeats) {
      const passengerNumber = passengers.length + 1;

      passengers.push({ number: passengerNumber, name: "", doc: "" });

      if (passengers.length === 1) {
        // Si es el primer pasajero, limpiar el mensaje de "No hay pasajeros"
        const group1 = document.getElementById("group1");
        const group2 = document.getElementById("group2");
        group1.innerHTML = "";
        group2.innerHTML = "";
      }

      renderPassengers(); // Renderizar pasajeros
      updateSeatStatus(); // Actualizar estado de asientos
      savePassengersToLocalStorage(); // Guardar en localStorage
    }

    // Deshabilitar el botón si se alcanzó el máximo de pasajeros
    if (passengers.length >= totalSeats) {
      const errorMessage = document.createElement("h2");
      errorMessage.textContent = "No hay más asientos disponibles";
      errorMessage.style.backgroundColor = "red";
      errorMessage.style.color = "white";
      errorMessage.style.padding = "10px";

      const passengerErrorContainer = document.getElementById("passengerError");
      passengerErrorContainer.innerHTML = "";
      passengerErrorContainer.appendChild(errorMessage);

      document.getElementById("addPassengerBtn").disabled = true;
    }
  }

  // Actualizar el estado de los asientos
  function updateSeatStatus() {
    const occupied = passengers.length; // Cantidad de pasajeros ocupando asientos
    const vacant = totalSeats - occupied; // Asientos vacíos restantes

    document.getElementById("occupiedPlaces").textContent = occupied;
    document.getElementById("vacantPlaces").textContent = vacant;

    // Cálculo del total recaudado en base a la cantidad de pasajeros y el precio
    const tripPrice = parseFloat(price || totalPrice);
    collectedAmount = occupied * tripPrice;
    document.getElementById("totalCollected").textContent =
      collectedAmount.toFixed(2);
  }

  // Mostrar los pasajeros en la interfaz
  function renderPassengers() {
    const group1 = document.getElementById("group1");
    const group2 = document.getElementById("group2");
    const pasajerosDiv = document.getElementById("pasajerosAnotados");

    // Limpiar contenido previo
    group1.innerHTML = "";
    group2.innerHTML = "";
    pasajerosDiv.innerHTML = "";

    if (!passengers || passengers.length === 0) {
        pasajerosDiv.innerHTML = "<p>No hay pasajeros anotados.</p>";
        return;
    }

    // Obtener el precio total desde el elemento HTML
    const totalPrice = parseInt(document.getElementById("totalPrice").textContent) || 0;

    passengers.forEach((passenger, index) => {
        passenger.numberOfpassage = index + 1;
        
        // Asegurar que cada pasajero tenga un precio asignado
        passenger.price = passenger.price ? parseInt(passenger.price) : totalPrice;
        passenger.pago = passenger.pago ? parseInt(passenger.pago) : 0;
        
        let paymentStatus;
        if (passenger.pago === passenger.price) {
            paymentStatus = "<span style='color: green;'><strong>Pagado</strong></span>";
        } else {
            const amountDue = passenger.price - passenger.pago;
            paymentStatus = `<span style='color: green;'><strong>Pagó: $${passenger.pago}</strong></span> - <span style='color: red;'><strong>Falta: $${amountDue}</strong></span>`;
        }

        // Crear y agregar elementos para la lista de pasajeros anotados
        const passengerElement = document.createElement("div");
        passengerElement.classList.add("passenger-item");
        passengerElement.innerHTML = `
            <p><strong>Pasajero ${index + 1}:</strong></p>
            <p><strong>Número de pasaje:</strong> ${passenger.numberOfpassage}</p>
            <p><strong>Nombre:</strong> ${passenger.name || "Sin nombre"}</p>
            <p><strong>DNI:</strong> ${passenger.dni || "Sin DNI"}</p>
            <p><strong>Estado de pago:</strong> ${paymentStatus}</p>
            <hr>
        `;
        pasajerosDiv.appendChild(passengerElement);
    });

    if (passengers.length === 0) {
        showNoPassengersMessage();
        return;
    }

    const midPoint = Math.ceil(passengers.length / 2);

    const table1 = createPassengerTable(passengers.slice(0, midPoint));
    group1.appendChild(table1);

    if (midPoint < passengers.length) {
        const table2 = createPassengerTable(passengers.slice(midPoint));
        group2.appendChild(table2);
    }
}



  // Crear la tabla de pasajeros
  function createPassengerTable(passengerList) {
    const table = document.createElement("table");
    table.classList.add("passenger-table");

    const header = document.createElement("thead");
    header.innerHTML = `
        <tr>
          <th>Pasajero</th>
          <th>Nombre</th>
          <th>Documento</th>
          <th>Pagos</th>
        </tr>
    `;
    table.appendChild(header);

    const body = document.createElement("tbody");

    passengerList.forEach((passenger) => {
        const row = document.createElement("tr");
    
        // Asignar número de pasaje correctamente
        const passengerNumber = passenger.numberOfpassage || "Desconocido";
    
        // Verificar datos del pasajero
        const passengerName = passenger.name || "Nombre desconocido";
        const passengerDni = passenger.dni || 0;
        const passengerPago = passenger.pago || 0;
    
        // Crear fila de la tabla
        row.innerHTML = `
            <td>${passengerNumber}</td>
            <td><input type="text" id="name${passengerNumber}" placeholder="Nombre" value="${passengerName}" /></td>
            <td><input type="text" id="dni${passengerNumber}" placeholder="Documento" value="${passengerDni}" /></td>
            <td><input type="text" id="pago${passengerNumber}" placeholder="Pago" value="${passengerPago}" /></td>

            <td><button class="delete-btn" data-passenger="${passengerNumber}">Eliminar</button></td>
        `;
        body.appendChild(row);

        // Agregar eventos para actualizar datos
        const nameInput = row.querySelector(`#name${passengerNumber}`);
        const dniInput = row.querySelector(`#dni${passengerNumber}`);
        const pagoInput = row.querySelector(`#pago${passengerNumber}`);

        if (nameInput) {
            nameInput.addEventListener("change", function () {
                updatePassengerData(passengerNumber, "name", this.value);
            });
        }

        if (dniInput) {
            dniInput.addEventListener("change", function () {
                updatePassengerData(passengerNumber, "dni", this.value);
            });
        }
        if (pagoInput) {
          pagoInput.addEventListener("change", function () {
                updatePassengerData(passengerNumber, "pago", this.value);
            });
        }
    });

    table.appendChild(body);

    // Agregar evento de eliminación de pasajeros
    body.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const passengerNumber = parseInt(this.getAttribute("data-passenger"));
            removePassenger(passengerNumber);
        });
    });

    return table;
}

// Función para eliminar un pasajero
function removePassenger(passengerNumber) {
    // Filtrar la lista para excluir el pasajero con el número de pasaje indicado
    passengers = passengers.filter(p => p.numberOfpassage !== passengerNumber);
    
    // Reasignar los números de pasaje para mantener el orden
    passengers.forEach((p, index) => {
        p.numberOfpassage = index + 1;
    });

    // Mostrar mensaje de confirmación
    showConfirmationMessage();

    // Volver a renderizar la tabla y la lista de pasajeros
    renderPassengers();
}

// Función para mostrar mensaje de confirmación
function showConfirmationMessage() {
  let messageBox = document.getElementById("confirmation-message");

  if (!messageBox) {
      messageBox = document.createElement("div");
      messageBox.id = "confirmation-message";
      messageBox.style.position = "fixed";
      messageBox.style.bottom = "20px";
      messageBox.style.right = "20px";
      messageBox.style.padding = "10px 20px";
      messageBox.style.background = "rgba(0,0,0,0.8)";
      messageBox.style.color = "white";
      messageBox.style.borderRadius = "5px";
      messageBox.style.fontSize = "14px";
      messageBox.style.zIndex = "1000";
      messageBox.style.opacity = "0";  // Para animación de entrada
      messageBox.style.transition = "opacity 0.5s ease-in-out";
      messageBox.style.display = "block";  // Asegurar visibilidad

      document.body.appendChild(messageBox);
      
      console.log("Mensaje de confirmación agregado al DOM.");
  }

  messageBox.innerText = "⚠️ Para confirmar los datos borrados, debes hacer clic en Guardar.";
  
  // Mostrar el mensaje con animación
  messageBox.style.display = "block"; // Asegurar que se muestra
  setTimeout(() => {
      messageBox.style.opacity = "1";
  }, 100);

  // Ocultar el mensaje después de 5 segundos con efecto fade-out
  setTimeout(() => {
      messageBox.style.opacity = "0";
      setTimeout(() => {
          messageBox.style.display = "none";
      }, 500);
  }, 5000);

  // Si el mensaje no aparece en el DOM, mostrar un alert
  setTimeout(() => {
      if (!document.getElementById("confirmation-message") || messageBox.style.opacity === "0") {
          alert("⚠️ Para confirmar los datos borrados, debes hacer clic en Guardar.");
      }
  }, 500);
}

// Agregar estilos al botón de eliminar
const style = document.createElement("style");
style.innerHTML = `
  .delete-btn {
      background: rgb(50, 180, 81);
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.3s ease;
      border-radius: 3px;
  }
  .delete-btn:hover {
      background: #cc0000;
  }
`;
document.head.appendChild(style);





  // Función para eliminar un pasajero
  function removePassenger(passengerNumber) {
    // Filtrar el pasajero a eliminar
    passengers = passengers.filter((p) => p.number !== passengerNumber);

    // Renumerar los pasajeros restantes
    passengers = passengers.map((passenger, index) => ({
      ...passenger,
      number: index + 1,
    }));

    // Si ya no hay más pasajeros, mostrar el mensaje
    if (passengers.length === 0) {
      showNoPassengersMessage();
    } else {
      renderPassengers();
    }

    // Actualizar estado de asientos
    updateSeatStatus();

    // Habilitar el botón de agregar si había sido deshabilitado
    document.getElementById("addPassengerBtn").disabled = false;
    document.getElementById("passengerError").innerHTML = "";

    // Guardar en localStorage
    savePassengersToLocalStorage();
  }

 
  // Función para capturar pantalla
  function captureScreen() {
    const element = document.getElementById("bus-info");

    html2canvas(element).then((canvas) => {
      canvas.toBlob(function (blob) {
        saveAs(
          blob,
          `pasajeros_${destination}_${new Date().toLocaleDateString()}.png`
        );
      });
    });
  }

  // Función para descargar Excel
  function downloadExcel() {
    const passengerData = passengers.map((p) => ({
      Número: p.number,
      Nombre: p.name || "No Ingresado",
      Documento: p.dni || "0",
      Pagos: p.pago || "0",
    }));

    const ws = XLSX.utils.json_to_sheet(passengerData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pasajeros");

    XLSX.writeFile(
      wb,
      `pasajeros_${destination}_${new Date().toLocaleDateString()}.xlsx`
    );
  }

  // Función para guardar los datos
  function saveData() {
    const passengersList = [];

    // Recorremos todos los pasajeros y sus inputs
    passengers.forEach((passenger) => {
        const passengerNumber = passenger.numberOfpassage || "Desconocido"; // Número de pasaje

        // Obtener los valores de los inputs correspondientes al nombre y DNI
        const nameInput = document.getElementById(`name${passengerNumber}`);
        const dniInput = document.getElementById(`dni${passengerNumber}`);
        const pagoInput = document.getElementById(`pago${passengerNumber}`);

        // Tomar los valores actuales de los inputs
        const passengerName = nameInput ? nameInput.value : "Desconocido";
        const passengerDni = dniInput ? dniInput.value : "00000000";
        const passengerPago = pagoInput ? pagoInput.value : "00000000";

        // Añadir el pasajero a la lista
        passengersList.push({
            numberOfpassage: passengerNumber,
            name: passengerName,
            dni: passengerDni,
            pago: passengerPago,
        });
    });

    // Crear objeto de viaje con los datos actuales de los pasajeros
    const tripData = {
        _id: tripId, // Incluir el ID si estamos actualizando un viaje existente
        numPassengers: parseInt(numPassengers),
        price: parseFloat(price),
        responsible,
        assistant,
        destination,
        passengers: passengersList, // Todos los pasajeros con sus datos actualizados
    };

    // Enviar los datos al backend usando fetch
    fetch("https://viajes-roan.vercel.app/viajes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
    })
    .then((response) => response.json())
    .then((data) => {
        alert("El viaje se ha guardado correctamente.");
        console.log(data);
    })
    .catch((error) => {
        alert("Hubo un error al guardar el viaje.");
        console.error(error);
    });
}


});
