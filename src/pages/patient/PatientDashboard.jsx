import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState(null);

  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchPatientId();
    fetchDoctors();
  }, []);

  const fetchPatientId = async () => {
    try {
      const res = await API.get('/admin/patients');
      const patient = res.data.find(
        (p) => p.user?.email === user?.email
      );
      if (patient) {
        setPatientId(patient.id);
        fetchAppointments(patient.id);
        fetchMedicalRecords(patient.id);
      }
    } catch (err) {
      toast.error('Failed to fetch patient info!');
    }
  };

  const fetchAppointments = async (id) => {
    try {
      const res = await API.get(`/patient/${id}/appointments`);
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to fetch appointments!');
    }
  };

  const fetchMedicalRecords = async (id) => {
    try {
      const res = await API.get(`/patient/${id}/medical-records`);
      setMedicalRecords(res.data);
    } catch (err) {
      console.log('No records yet');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/patient/doctors');
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to fetch doctors!');
    }
  };

  const handleBookAppointment = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate) {
      toast.error('Please fill all fields!');
      return;
    }
    try {
      await API.post('/patient/appointments', {
        patient: { id: patientId },
        doctor: { id: appointmentForm.doctorId },
        appointmentDate: appointmentForm.appointmentDate,
        notes: appointmentForm.notes,
      });
      toast.success('Appointment booked successfully!');
      setAppointmentForm({ doctorId: '', appointmentDate: '', notes: '' });
      fetchAppointments(patientId);
      setActiveTab('appointments');
    } catch (err) {
      toast.error('Failed to book appointment!');
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await API.put(`/patient/appointments/${id}/cancel`);
      toast.success('Appointment cancelled!');
      fetchAppointments(patientId);
    } catch (err) {
      toast.error('Failed to cancel appointment!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🏥 Hospital</h2>
        <p style={styles.sidebarUser}>🧑‍🤝‍🧑 {user?.name}</p>
        <hr style={styles.hr} />

        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'book', label: '➕ Book Appointment' },
          { key: 'appointments', label: '📅 My Appointments' },
          { key: 'records', label: '📋 Medical Records' },
          { key: 'doctors', label: '👨‍⚕️ Doctors' },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.sidebarBtn,
              backgroundColor: activeTab === tab.key ? '#c05621' : 'transparent',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}

        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.heading}>📊 My Dashboard</h2>
            <div style={styles.cardRow}>
              <div style={{ ...styles.statCard, backgroundColor: '#fefcbf' }}>
                <h3 style={{ color: '#744210' }}>⏳ Pending</h3>
                <p style={styles.statNumber}>{pendingCount}</p>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#c6f6d5' }}>
                <h3 style={{ color: '#276749' }}>✅ Confirmed</h3>
                <p style={styles.statNumber}>{confirmedCount}</p>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#ebf8ff' }}>
                <h3 style={{ color: '#2b6cb0' }}>📋 Records</h3>
                <p style={styles.statNumber}>{medicalRecords.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div>
            <h2 style={styles.heading}>➕ Book Appointment</h2>
            <div style={styles.formCard}>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Doctor</label>
                <select
                  style={styles.input}
                  value={appointmentForm.doctorId}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })
                  }
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.user?.name} — {doc.specialization} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  style={styles.input}
                  value={appointmentForm.appointmentDate}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe your symptoms or reason for visit"
                  value={appointmentForm.notes}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, notes: e.target.value })
                  }
                />
              </div>

              <button style={styles.submitBtn} onClick={handleBookAppointment}>
                📅 Book Appointment
              </button>
            </div>
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 style={styles.heading}>📅 My Appointments</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={styles.tableRow}>
                    <td style={styles.td}>{apt.id}</td>
                    <td style={styles.td}>Dr. {apt.doctor?.user?.name}</td>
                    <td style={styles.td}>
                      {new Date(apt.appointmentDate).toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor:
                          apt.status === 'CONFIRMED' ? '#c6f6d5' :
                          apt.status === 'PENDING' ? '#fefcbf' :
                          apt.status === 'CANCELLED' ? '#fed7d7' : '#bee3f8',
                        color:
                          apt.status === 'CONFIRMED' ? '#276749' :
                          apt.status === 'PENDING' ? '#744210' :
                          apt.status === 'CANCELLED' ? '#9b2c2c' : '#2a4365',
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={styles.td}>{apt.notes || '-'}</td>
                    <td style={styles.td}>
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          style={styles.cancelBtn}
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="6" style={styles.noData}>
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div>
            <h2 style={styles.heading}>📋 My Medical Records</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Diagnosis</th>
                  <th style={styles.th}>Prescription</th>
                  <th style={styles.th}>Treatment</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {medicalRecords.map((rec) => (
                  <tr key={rec.id} style={styles.tableRow}>
                    <td style={styles.td}>{rec.id}</td>
                    <td style={styles.td}>Dr. {rec.doctor?.user?.name}</td>
                    <td style={styles.td}>{rec.diagnosis}</td>
                    <td style={styles.td}>{rec.prescription}</td>
                    <td style={styles.td}>{rec.treatment}</td>
                    <td style={styles.td}>{rec.recordDate}</td>
                  </tr>
                ))}
                {medicalRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" style={styles.noData}>
                      No medical records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={styles.heading}>👨‍⚕️ Available Doctors</h2>
            <div style={styles.cardRow}>
              {doctors.map((doc) => (
                <div key={doc.id} style={styles.doctorCard}>
                  <h3 style={styles.doctorName}>👨‍⚕️ Dr. {doc.user?.name}</h3>
                  <p style={styles.doctorInfo}>🔬 {doc.specialization}</p>
                  <p style={styles.doctorInfo}>🏢 {doc.department}</p>
                  <p style={styles.doctorInfo}>📞 {doc.phone}</p>
                  <button
                    style={styles.bookBtn}
                    onClick={() => {
                      setAppointmentForm({ ...appointmentForm, doctorId: doc.id });
                      setActiveTab('book');
                    }}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              ))}
              {doctors.length === 0 && (
                <p style={{ color: '#a0aec0' }}>No doctors available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#7b341e',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: '8px',
  },
  sidebarUser: {
    color: '#fbd38d',
    textAlign: 'center',
    fontSize: '14px',
  },
  hr: {
    borderColor: '#9c4221',
    margin: '12px 0',
  },
  sidebarBtn: {
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: '#c53030',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '32px',
  },
  main: {
    flex: 1,
    padding: '32px',
  },
  heading: {
    color: '#2d3748',
    marginBottom: '24px',
  },
  cardRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statCard: {
    padding: '24px',
    borderRadius: '12px',
    minWidth: '160px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '8px 0',
  },
  doctorCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    minWidth: '200px',
    maxWidth: '250px',
  },
  doctorName: {
    color: '#2d3748',
    marginBottom: '8px',
  },
  doctorInfo: {
    color: '#718096',
    fontSize: '14px',
    margin: '4px 0',
  },
  bookBtn: {
    backgroundColor: '#c05621',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '12px',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableHeader: {
    backgroundColor: '#c05621',
    color: 'white',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#4a5568',
  },
  noData: {
    padding: '24px',
    textAlign: 'center',
    color: '#a0aec0',
  },
  cancelBtn: {
    backgroundColor: '#fc8181',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    maxWidth: '600px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#4a5568',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    minHeight: '80px',
    resize: 'vertical',
  },
  submitBtn: {
    backgroundColor: '#c05621',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default PatientDashboard;