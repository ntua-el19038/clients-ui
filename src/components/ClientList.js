import React, { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';

import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Switch,
    FormControlLabel,
    TextField,
    Select,
    MenuItem,
    Button,
    Box,
    Typography,
    Modal,
    Pagination, Snackbar, Alert,
} from "@mui/material";
import authApi from "../API/auth";

const ClientListPage = () => {
    const [clients, setClients] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [searchName, setSearchName] = useState("");
    const [emailFilter, setEmailFilter] = useState("all");
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // New state for detailed info modal
    const [detailData, setDetailData] = useState(null); // State for detailed shop data
    // Snackbar states
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTime, setAlertTime] = useState(2000);
    const [alertSeverity, setAlertSeverity] = useState("");
    const [alertInfo, setAlertInfo] = useState({});
    const [modalData, setModalData] = useState({

        notes: [],
        content: "",
        username: "",
        time: ""
    }); // State for modal content// Default empty array for notes
    const alertTypes = {
        SUCCESS: "success",
        ERROR: "error"
    };
    const showAlert = (message, type, time = 2) => {
        setAlertSeverity(type);
        setAlertTime(time * 1000)
        setAlertMessage(message);
        setOpenSnackbar(true);
    };
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [newNote, setNewNote] = useState(""); // State for new note input

    useEffect(() => {
        const requestData={
            "username": "dev",
            "password": "1234"
        }
        authApi.login(requestData).then((response) => {
            // console.log("response", response);
            let token = JSON.stringify(response.headers.authorization);
            token = token.substring(8, token.length - 1);
            localStorage.setItem("token", token);

        });
        const fetchMunicipalities = async () => {
            try {
                const response = await authApi.fetchMunicipality();
                const data = response.data["returnobject"];
                setMunicipalities(data || []);
            } catch (error) {
                console.error("Error fetching municipalities:", error);
            }
        };

        fetchMunicipalities();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await authApi.fetchAll({
                    page: currentPage - 1,
                    size: pageSize,
                }, {
                    name: searchName,
                    municipality: selectedMunicipality,
                });
                const data = response.data["returnobject"]["page"]["content"];

                // Initialize clients and ensure notes array
                const clientsWithNotes = data.map(client => ({
                    ...client,
                    notes: Array.isArray(client.notes) ? client.notes : [], // Ensure notes is always an array
                }));

                setClients(clientsWithNotes);

                // Create initial selectedOptions state based on fetched data
                const initialSelectedOptions = {};
                clientsWithNotes.forEach(client => {
                    initialSelectedOptions[client.id] = {};
                    client.approachDetails.forEach(detail => {
                        initialSelectedOptions[client.id][detail.approachWay] = detail.approached;
                    });
                });

                setSelectedOptions(initialSelectedOptions);
                setTotalPages(response.data["returnobject"]["page"]["totalPages"]);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        fetchClients();
    }, [currentPage, pageSize, selectedMunicipality, searchName, emailFilter]);


// Open the modal when the "View Notes" button is clicked
    const handleOpenModal = (client) => {
        setModalData({
            ...client,
            notes: Array.isArray(client.notes) ? client.notes : [], // Ensure notes are an array
        });
        setIsModalOpen(true); // Open the modal
    };

// Close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false); // Close the modal
        setModalData({}); // Optionally clear modal data when closing
    };

    // Open the detail modal when a row is clicked
    const handleOpenDetailModal = (client) => {
        setDetailData(client);
        setIsDetailModalOpen(true);
    };

    // Close the detail modal
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailData(null);
    };

    const handleOptionChange = (clientId, method) => {

        setSelectedOptions((prev) => ({
            ...prev,
            [clientId]: {
                ...prev[clientId],
                [method]: !prev[clientId]?.[method],
            },
        }));
        updateOptionInDB(clientId, method, );
    };

    // Function to update the database
    const updateOptionInDB = async (clientId, option) => {
        try {
            const clientToUpdate = clients.find((client) => client.id === clientId);
            const updatedApproachDetails = clientToUpdate.approachDetails.map((detail) => {
                if (detail.approachWay === option && detail.approached === true) {
                    return {
                        ...detail,
                        approached: false, // Set approached to true
                        // approachTime: new Date().toISOString(), // Update time if needed
                    };
                }
                else if (detail.approachWay === option && detail.approached === false){
                    return {
                        ...detail,
                        approached: true, // Set approached to true
                        // approachTime: new Date().toISOString(), // Update time if needed
                    };
                }
                return detail;
            });
            clientToUpdate.approachDetails=updatedApproachDetails;
            console.log(updatedApproachDetails)
            console.log(clientToUpdate)
            const response = await authApi.updateUser(clientToUpdate);
            console.log('Response from server:', response.data);
            showAlert("Data saved successfully", alertTypes.SUCCESS)
            // Update the clients state correctly
            setClients((prevClients) =>
                prevClients.map((client) => {
                    if (client.id === modalData.id) {
                        // Add the new note to the client
                        // console.log(client.id)
                        return response.data["returnobject"];
                    }
                    return client; // Return the client unchanged if it's not the one being updated
                })
            );
        } catch (error) {
            console.error('Error updating contact method in the database:', error);
            showAlert('Could not save your data. Please try again', alertTypes.ERROR);

        }
    };

    const handleAddNote = () => {
        if (newNote.length > 100) {
            alert("Note cannot exceed 100 characters.");
            return;
        }

        const newNoteObject = {
            note: newNote,
            // approachTime: new Date().toISOString(),
        };

        // Update modalData with the new note
        setModalData((prevData) => ({
            ...prevData,
            notes: [...prevData.notes, newNoteObject],
        }));

        updateNotesInDB(modalData.id, newNoteObject)
        // Reset the note input field
        setNewNote(""); // Clear input after adding the note
    };

// Save notes to the database
    const updateNotesInDB = async (clientId, newNote) => {
        try {
            // Update clients with the new note
            setClients((prevClients) =>
                prevClients.map((client) => {
                    if (client.id === modalData.id) {
                        // Add the new note to the client
                        console.log(client.id)
                        return {
                            ...client,
                            notes: [...client.notes, newNote],
                        };
                    }

                    return client; // Return the client unchanged if it's not the one being updated
                })
            );
            const updatedClient = clients.find((client) => client.id === clientId);
            console.log(updatedClient)
            updatedClient.notes =[...updatedClient.notes, newNote]
            console.log(updatedClient)
            const response = await authApi.updateUser(updatedClient);
            console.log('Response from server:', response.data);
            showAlert("Data saved successfully", alertTypes.SUCCESS)
            setClients((prevClients) =>
                prevClients.map((client) => {
                    if (client.id === modalData.id) {
                        // Add the new note to the client
                        // console.log(client.id)
                        return response.data["returnobject"];
                    }
                    return client; // Return the client unchanged if it's not the one being updated
                })
            );
            // Update the clients state correctly
            // setClients((prevClients) => {
            //     const updatedClients = prevClients.map((client) =>
            //         client.id === clientId ? { ...client, notes: updatedClient.notes } : client
            //     );
            //     return updatedClients;
            // });
        } catch (error) {
            console.error('Error updating notes in the database:', error);
            showAlert('Could not save your data. Please try again', alertTypes.ERROR);

        }
    };



    return (
    <>
        <Box>
            {/* Header */}
            <Box sx={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "white", padding: 2, borderBottom: "1px solid #ddd" }}>
                <Typography variant="h4">Client List</Typography>
                <Box display="flex" gap={2} mt={2}>
                    <TextField
                        label="Search by name"
                        variant="outlined"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        fullWidth
                    />
                    <Select
                        value={selectedMunicipality}
                        onChange={(e) => setSelectedMunicipality(e.target.value)}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="">All Municipalities</MenuItem>
                        {municipalities.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Table */}
            <Container>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Area</TableCell>
                            <TableCell>Zip Code</TableCell>
                            <TableCell>Approach Methods</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.id}>
                                {/* Name Cell */}
                                <TableCell onClick={() => handleOpenDetailModal(client)} style={{ cursor: "pointer" }}>
                                    <Typography>{client.name}</Typography>
                                </TableCell>

                                {/* Area Cell */}
                                <TableCell onClick={() => handleOpenDetailModal(client)} style={{ cursor: "pointer" }}>
                                    <Typography>{client.useeClientLocation?.area || "N/A"}</Typography>
                                </TableCell>

                                {/* Zip Code Cell */}
                                <TableCell onClick={() => handleOpenDetailModal(client)} style={{ cursor: "pointer" }}>
                                    <Typography>{client.useeClientLocation?.zip || "N/A"}</Typography>
                                </TableCell>

                                {/* Approach Methods Cell */}
                                <TableCell>
                                    {["DOOR2DOOR", "EMAIL", "PHONE"].map((method) => (
                                        <FormControlLabel
                                            key={method}
                                            control={
                                                <Switch
                                                    checked={selectedOptions[client.id]?.[method] || false}
                                                    onChange={() => handleOptionChange(client.id, method)}
                                                />
                                            }
                                            label={method}
                                        />
                                    ))}
                                </TableCell>

                                {/* Notes Cell */}
                                <TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents the row click event from triggering
                                                handleOpenModal(client);
                                            }}
                                        >
                                            View Notes
                                        </Button>
                                    </TableCell>


                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </Container>

            {/* Pagination */}
            <Box sx={{ position: "sticky", bottom: 0, zIndex: 1000, backgroundColor: "white", padding: 2, borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, value) => setCurrentPage(value)}
                    color="primary"
                />
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">Items per page:</Typography>
                    <Select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        displayEmpty
                        size="small"
                    >
                        {[10, 15, 25, 50, 100].map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>
            {/* Modal */}
            {modalData && (
                <Modal open={isModalOpen} onClose={handleCloseModal}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: "background.paper",
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6">{modalData.name}</Typography>
                        {/*<Typography variant="body2" mt={2}>*/}
                        {/*    Area: {modalData.useeClientLocation?.area || "N/A"}*/}
                        {/*</Typography>*/}
                        {/*<Typography variant="body2" mt={1}>*/}
                        {/*    Zip Code: {modalData.useeClientLocation?.zip || "N/A"}*/}
                        {/*</Typography>*/}
                        {/* Notes */}
                        <Box mt={2} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                            <Typography variant="body2">Notes:</Typography>
                            {modalData.notes && modalData.notes.length > 0 ? (
                                modalData.notes.map((note, index) => (
                                    <Box key={index} mt={1} sx={{ borderBottom: "1px solid #ddd", paddingBottom: 1 }}>
                                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                            {note.note}
                                        </Typography>
                                        <Typography variant="caption">
                                            {note.userID} - {new Date(note.approachTime).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2">No notes yet.</Typography>
                            )}
                        </Box>
                        {/* New Note */}
                        <TextField
                            label="Add a new note"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            fullWidth
                            margin="normal"
                            inputProps={{ maxLength: 100 }}
                            helperText={`${newNote.length}/100`}
                        />
                        <Button
                            onClick={handleAddNote}
                            variant="contained"
                            sx={{ mt: 2 }}
                            disabled={!newNote.trim()}
                        >
                            Add Note
                        </Button>
                    </Box>
                </Modal>

            )}
            {/* Detail Modal */}
            {detailData && (
                <Modal open={isDetailModalOpen} onClose={handleCloseDetailModal}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 600,
                            bgcolor: "background.paper",
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                            Detailed Information
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1rem" }}>
                            <strong>Name:</strong> {detailData.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1rem" }}>
                            <strong>Address:</strong>{" "}
                            {`${detailData.useeClientLocation?.street || ""} ${detailData.useeClientLocation?.number || ""}, ${detailData.useeClientLocation?.area || ""}, ${detailData.useeClientLocation?.zip || ""}`}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1.2rem" }}>
                            <strong>Location:</strong>{" "}
                                <a
                                    href={`${detailData.pin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "blue", textDecoration: "underline" }}
                                >
                                    Open in Google Maps
                                </a>
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1rem" }}>
                            <strong>Phone:</strong> {detailData.phone || "N/A"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1rem" }}>
                            <strong>Email:</strong>{" "}
                            {detailData?.emails?.length > 0 ? detailData.emails.join(", ") : "N/A"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: "1rem" }}>
                            <strong>Type:</strong> {detailData.type || "N/A"}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleCloseDetailModal}
                            sx={{ mt: 2, fontSize: "1rem" }}
                        >
                            Close
                        </Button>
                    </Box>
                </Modal>
            )}
        </Box>
        {/*Alerts*/}
        <Snackbar
            open={openSnackbar}
            autoHideDuration={2000}
            onClose={handleCloseSnackbar}
            message={alertMessage}
            anchorOrigin={{ vertical: 'center', horizontal: 'center' }} // Centers the Snackbar
        >
            <Alert onClose={handleCloseSnackbar} severity={alertSeverity} sx={{ width: '100%' }}>
                {alertMessage}
            </Alert>
        </Snackbar>


    </>

    );
};

export default ClientListPage;