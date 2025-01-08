const forms = document.querySelectorAll("form");
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
    }
    form.classList.add("was-validated");
  });
});

const formUploadCancel = document.getElementById("upload_file_cancel");
if (formUploadCancel) {
  formUploadCancel.addEventListener("click", () => {
    formUploadCancel.form.classList.remove("was-validated");
  });
}

const createFolderCancel = document.getElementById("create_folder_cancel");
if (createFolderCancel) {
  createFolderCancel.addEventListener("click", () => {
    createFolderCancel.form.classList.remove("was-validated");
  });
}

const onFolderRename = async (id, name) => {
  const input = document.getElementById(`folder${id}_new_name`);
  if (!input.checkValidity()) {
    input.classList.add("is-invalid");
    input.focus();
    input.nextElementSibling.textContent = "Please enter a valid folder name.";
    return;
  }
  try {
    const response = await fetch(`/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderId: Number(id),
        newName: input.value,
      }),
    });
    if (response.status == 200) {
      window.location.reload();
    } else if (!response.ok) {
      const { errors } = await response.json();
      input.classList.add("is-invalid");
      input.focus();
      input.nextElementSibling.textContent = errors[0].msg;
    }
  } catch (error) {
    alert(`An error occurred while renaming the folder "${name}".`);
  }
};

const onFolderDelete = async (id, name) => {
  try {
    const response = await fetch(`/folders/${id}`, { method: "DELETE" });
    if (response.status == 200) {
      window.location.reload();
    } else if (!response.ok) {
      alert("Error: Failed to delete folder.");
    }
  } catch (error) {
    alert(`An error occurred while deleting the folder "${name}".`);
  }
};

const onFileRename = async (id, name) => {
  const input = document.getElementById(`file${id}_new_name`);
  if (!input.checkValidity()) {
    input.classList.add("is-invalid");
    input.focus();
    input.nextElementSibling.textContent = "Please enter a valid file name.";
    return;
  }
  try {
    const response = await fetch(`/files/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: id,
        newName: input.value,
      }),
    });
    if (response.status == 200) {
      window.location.reload();
    } else if (!response.ok) {
      const { errors } = await response.json();
      input.classList.add("is-invalid");
      input.focus();
      input.nextElementSibling.textContent = errors[0].msg;
    }
  } catch (error) {
    alert(`An error occurred while renaming the file "${name}".`);
  }
};

const onFileDelete = async (id, name) => {
  try {
    const response = await fetch(`/files/${id}`, { method: "DELETE" });
    if (response.status == 200) {
      window.location.reload();
    } else if (!response.ok) {
      alert("Error: Failed to delete file");
    }
  } catch (error) {
    alert(`An error occurred while deleting the file "${name}".`);
  }
};

const uploadFileform = document.querySelector('form[enctype="multipart/form-data"]');
if (uploadFileform) {
  uploadFileform.addEventListener("submit", (event) => {
    const fileInput = document.getElementById("uploaded_file");
    const file = fileInput.files[0];
    if (file && file.size > 1048576) {
      event.preventDefault();
      fileInput.classList.add("is-invalid");
      fileInput.nextElementSibling.textContent = "File size must be less than 1MB.";
      setTimeout(() => {
        uploadFileform.classList.remove("was-validated");
      }, 300);
    }
  });
}
