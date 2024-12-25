const onFolderRename = async (id, name) => {
  try {
    const response = await fetch(`/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderId: Number(id),
        newName: document.getElementById(`folder${id}_new_name`).value,
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
      alert("Error: Failed to delete folder");
    }
  } catch (error) {
    alert(`An error occurred while deleting the folder "${name}".`);
  }
};

const onFileRename = async (id, name) => {
  try {
    const response = await fetch(`/files/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: id,
        newName: document.getElementById(`file${id}_new_name`).value,
      }),
    });
    if (response.status == 200) {
      window.location.reload();
    } else if (!response.ok) {
      alert("Error: Failed to rename file");
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
