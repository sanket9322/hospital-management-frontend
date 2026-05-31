import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [doctorId, setDoctorId] = useState(null);

  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: '',
    treatment: '',
    patientId: '',
    appointmentId: '',
  });

  useEffect(() => {
    fetchDoctorId();
  }, []);

  const fetchDoctorId = async () => {
    try {
      const res = await API.get('/admin/doctors');
      const doctor = res.data.find(
        (d) => d.user?.email === user?.email
      );
      if (doctor) {
        setDoctorId(doctor.id);
        fetchAppointments(doctor.id);
        fetchMedicalRecords(doctor.id);
      }
    } catch (err) {
      toast.error('Failed to fetch doctor info!');
    }
  };

  const fetchAppointments = async (id) => {
    try {
      const res = await API.get(`/doctor/${id}/appointments`);
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to fetch appointments!');
    }
  };

  const fetchMedicalRecords = async (id) => {
    try {
      const res = await API.get(`/doctor/${id}/patients/0/records`);
      setMedicalRecords(res.data);
    } catch (err) {
      console.log('No records yet');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/doctor/appointments/${id}/status?status=${status}`);
      toast.success('Status updated!');
      fetchAppointments(doctorId);
    } catch (err) {
      toast.error('Failed to update status!');
    }
  };

  const handleAddRecord = async () => {
    try {
      await API.post('/doctor/medical-records', {
        diagnosis: recordForm.diagnosis,
        prescription: recordForm.prescription,
        treatment: recordForm.treatment,
        patient: { id: recordForm.patientId },
        doctor: { id: doctorId },
        appointment: { id: recordForm.appointmentId },
        recordDate: new Date().toISOString().split('T')[0],
      });
      toast.success('Medical record added!');
      setRecordForm({
        diagnosis: '',
        prescription: '',
        treatment: '',
        patientId: '',
        appointmentId: '',
      });
    } catch (err) {
      toast.error('Failed to add record!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🏥 Hospital</h2>
        <p style={styles.sidebarUser}>👨‍⚕️ Dr. {user?.name}</p>
        <hr style={styles.hr} />

        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'appointments', label: '📅 Appointments' },
          { key: 'records', label: '📋 Add Record' },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.sidebarBtn,
              backgroundColor: activeTab === tab.key ? '#276749' : 'transparent',
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
                <h3 style={{ color: '#2b6cb0' }}>🏁 Completed</h3>
                <p style={styles.statNumber}>{completedCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 style={styles.heading}>📅 My Appointments</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Patient</th>
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
                    <td style={styles.td}>{apt.patient?.user?.name}</td>
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {apt.status === 'PENDING' && (
                          <button
                            style={styles.confirmBtn}
                            onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            style={styles.completeBtn}
                            onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
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

        {/* Add Medical Record Tab */}
        {activeTab === 'records' && (
          <div>
            <h2 style={styles.heading}>📋 Add Medical Record</h2>
            <div style={styles.formCard}>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Patient ID</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter Patient ID"
                  value={recordForm.patientId}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, patientId: e.target.value })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Appointment ID</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter Appointment ID"
                  value={recordForm.appointmentId}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, appointmentId: e.target.value })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Diagnosis</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Enter diagnosis"
                  value={recordForm.diagnosis}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, diagnosis: e.target.value })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Prescription</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Enter prescription"
                  value={recordForm.prescription}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, prescription: e.target.value })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Treatment</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Enter treatment"
                  value={recordForm.treatment}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, treatment: e.target.value })
                  }
                />
              </div>

              <button style={styles.submitBtn} onClick={handleAddRecord}>
                ➕ Add Medical Record
              </button>
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
    backgroundColor: '#1c4532',
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
    color: '#9ae6b4',
    textAlign: 'center',
    fontSize: '14px',
  },
  hr: {
    borderColor: '#2d6a4f',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tableHeader: {
    backgroundColor: '#276749',
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
  confirmBtn: {
    backgroundColor: '#68d391',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  completeBtn: {
    backgroundColor: '#63b3ed',
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
    backgroundColor: '#276749',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default DoctorDashboard;