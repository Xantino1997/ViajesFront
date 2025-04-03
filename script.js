// document.addEventListener('DOMContentLoaded', () => {
//     const addMemberForm = document.getElementById('add-member-form');
//     const membersContainer = document.getElementById('members-container');
//     const statusContainer = document.getElementById('status-container');
//     const statusMessage = document.getElementById('status-message');
//     const errorMessage = document.getElementById('error-message');
//     const editMemberModal = document.getElementById('edit-member-modal');
//     const nameInput = document.getElementById('edit-name');
//     const groupInput = document.getElementById('edit-group');
//     const statusInputs = document.querySelectorAll('#edit-status-container input');
//     const saveBtn = document.getElementById('save-edit');
//     const cancelBtn = document.getElementById('cancel-edit');

//     const statuses = ['PR', 'Anc', 'Exp', 'Sm', 'Aux', 'Super'];

//     // Crear checkboxes en dos líneas de 3 elementos
//     const createStatusCheckboxes = () => {
//         for (let i = 0; i < statuses.length; i += 3) {
//             const row = document.createElement('div');
//             row.classList.add('status-row');

//             statuses.slice(i, i + 3).forEach(status => {
//                 const checkbox = document.createElement('input');
//                 checkbox.type = 'checkbox';
//                 checkbox.id = `status-${status}`;
//                 checkbox.value = status;

//                 const label = document.createElement('label');
//                 label.setAttribute('for', `status-${status}`);
//                 label.textContent = status;

//                 const container = document.createElement('div');
//                 container.classList.add('status-item');
//                 container.appendChild(checkbox);
//                 container.appendChild(label);

//                 row.appendChild(container);
//             });

//             statusContainer.appendChild(row);
//         }
//     };

//     createStatusCheckboxes();

//     addMemberForm.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const name = document.getElementById('name').value.trim();
//         const group = document.getElementById('group').value.trim();
//         const selectedStatuses = Array.from(document.querySelectorAll('#status-container input:checked'))
//             .map(checkbox => checkbox.value);

//         if (!name || !group || selectedStatuses.length === 0) {
//             alert('Por favor, complete todos los campos.');
//             return;
//         }

//         const memberData = { name, group, status: selectedStatuses.join(', ') };

//         try {
//             const response = await fetch('http://localhost:3000/api/members', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(memberData),
//             });

//             if (!response.ok) throw new Error('Error al guardar el miembro');

//             const newMember = await response.json();
//             displayMember(newMember);
//             statusMessage.style.display = 'block';
//             errorMessage.style.display = 'none';
//             addMemberForm.reset();
//         } catch (error) {
//             console.error('Error al agregar miembro:', error);
//             statusMessage.style.display = 'none';
//             errorMessage.style.display = 'block';
//         }
//     });

//     function displayMember(member) {
//         let groupDiv = document.getElementById(`group-${member.group}`);
//         if (!groupDiv) {
//             groupDiv = document.createElement('div');
//             groupDiv.id = `group-${member.group}`;
//             groupDiv.classList.add('group-container');
//             groupDiv.innerHTML = `<h3>Grupo ${member.group}</h3>`;

//             const captureBtn = document.createElement('button');
//             captureBtn.textContent = 'Capturar Grupo';
//             captureBtn.onclick = () => captureGroup(member.group);
//             groupDiv.appendChild(captureBtn);

//             const exportBtn = document.createElement('button');
//             exportBtn.textContent = 'Exportar a Excel';
//             exportBtn.onclick = () => exportToExcel(member.group);
//             groupDiv.appendChild(exportBtn);

//             membersContainer.appendChild(groupDiv);
//         }

//         const memberDiv = document.createElement('div');
//         memberDiv.classList.add('member-item');
//         memberDiv.innerHTML = `<strong>${member.name}</strong> - Estado: ${member.status}`;
//         memberDiv.setAttribute('data-id', member.id);
//         memberDiv.ondblclick = () => editMember(member, memberDiv);
//         groupDiv.appendChild(memberDiv);

//         sortGroups();
//     }

//     function captureGroup(groupId) {
//         const groupElement = document.getElementById(`group-${groupId}`);
//         if (!groupElement) return;

//         html2canvas(groupElement).then(canvas => {
//             const link = document.createElement('a');
//             link.href = canvas.toDataURL();
//             link.download = `grupo-${groupId}.png`;
//             link.click();
//         });
//     }

//     function exportToExcel(groupId) {
//         const wb = XLSX.utils.book_new();
//         const groupDiv = document.getElementById(`group-${groupId}`);
//         if (!groupDiv) return;

//         const rows = Array.from(groupDiv.getElementsByClassName('member-item'))
//             .map(memberDiv => [memberDiv.textContent]);

//         const ws = XLSX.utils.aoa_to_sheet([['Nombre - Estado'], ...rows]);
//         XLSX.utils.book_append_sheet(wb, ws, `Grupo ${groupId}`);
//         XLSX.writeFile(wb, `grupo-${groupId}.xlsx`);
//     }

//     function editMember(member, memberDiv) {
//         const nameInput = document.getElementById('edit-name');
//         const groupInput = document.getElementById('edit-group');
//         const statusContainer = document.getElementById('edit-status-container');
        
//         // Limpiar los estados previos
//         statusContainer.innerHTML = '';
        
//         // Asegurarse de que member.status sea una cadena (en caso de que sea un array u otro tipo)
//         let status = member.status;
//         if (Array.isArray(status)) {
//             status = status.join(', '); // Convertir a cadena si es un array
//         }
        
//         // Rellenar los campos del modal
//         nameInput.value = member.name;
//         groupInput.value = member.group;
        
//         // Todos los estados disponibles para elegir
//         const allPossibleStatuses = ['Activo', 'Inactivo', 'Suspendido', 'Pendiente'];  // Aquí defines los estados posibles
        
//         allPossibleStatuses.forEach(statusOption => {
//             const checkbox = document.createElement('input');
//             checkbox.type = 'checkbox';
//             checkbox.id = `status-${statusOption}`;
//             checkbox.value = statusOption;
            
//             // Marcar el checkbox si el estado está en la lista actual del miembro
//             checkbox.checked = status.split(', ').includes(statusOption);
        
//             const label = document.createElement('label');
//             label.setAttribute('for', `status-${statusOption}`);
//             label.textContent = statusOption;
        
//             const container = document.createElement('div');
//             container.classList.add('status-item');
//             container.appendChild(checkbox);
//             container.appendChild(label);
        
//             statusContainer.appendChild(container);
//         });
        
//         // Mostrar el modal
//         document.getElementById('edit-member-modal').style.display = 'block';
        
//         document.getElementById('save-edit').onclick = () => {
//             const updatedName = nameInput.value;
//             const updatedGroup = groupInput.value;
            
//             // Obtener los estados seleccionados por el usuario
//             const updatedStatuses = Array.from(document.querySelectorAll('#edit-status-container input:checked'))
//                 .map(checkbox => checkbox.value);
        
//             const updatedMember = {
//                 id: member.id,
//                 name: updatedName,
//                 group: updatedGroup,
//                 status: updatedStatuses.join(', ') // Concatenar los estados seleccionados
//             };
        
//             // Enviar los cambios al servidor
//             fetch(`http://localhost:3000/api/members/${member.id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(updatedMember)
//             })
//             .then(response => {
//                 if (!response.ok) throw new Error('Error al actualizar el miembro');
//                 return response.json();
//             })
//             .then(updatedMember => {
//                 memberDiv.innerHTML = `<strong>${updatedMember.name}</strong> - Estado: ${updatedMember.status}`;
//                 document.getElementById('edit-member-modal').style.display = 'none';  // Ocultar el modal
//             })
//             .catch(error => console.error('Error al actualizar:', error));
//         };
        
//         document.getElementById('cancel-edit').onclick = () => {
//             document.getElementById('edit-member-modal').style.display = 'none';  // Cerrar el modal sin guardar cambios
//         };
//     }
    
    
    

//     function sortGroups() {
//         const groups = Array.from(membersContainer.children);
//         groups.sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));
//         groups.forEach(group => membersContainer.appendChild(group));
//     }

//     async function fetchMembers() {
//         try {
//             const response = await fetch('http://localhost:3000/api/members');
//             if (!response.ok) throw new Error('Error al cargar los miembros');

//             const members = await response.json();
//             members.forEach(member => displayMember(member));
//         } catch (error) {
//             console.error('Error al obtener los miembros:', error);
//             alert('Hubo un error al cargar los miembros.');
//         }
//     }

//     fetchMembers();
// });


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
  