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
      alert(`Error: ${errorData.message || "Failed to rename folder"}`);
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
      alert(`Error: ${errorData.message || "Failed to delete folder"}`);
    }
  } catch (error) {
    alert(`An error occurred while deleting the folder "${name}".`);
  }
};
