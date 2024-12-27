const forms = document.querySelectorAll("form");
forms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
    }
    form.classList.add("was-validated");
  });
});

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
      alert("Error: Failed to rename folder");
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
      alert("Error: Failed to rename file.");
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
