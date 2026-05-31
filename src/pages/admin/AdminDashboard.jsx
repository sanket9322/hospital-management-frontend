import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/admin/doctors');
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to fetch doctors!');
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get('/admin/patients');
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to fetch patients!');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to fetch appointments!');
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      await API.delete(`/admin/doctors/${id}`);
      toast.success('Doctor deleted!');
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to delete doctor!');
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await API.delete(`/admin/patients/${id}`);
      toast.success('Patient deleted!');
      fetchPatients();
    } catch (err) {
      toast.error('Failed to delete patient!');
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await API.put(`/admin/appointments/${id}/cancel`);
      toast.success('Appointment cancelled!');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🏥 Hospital</h2>
        <p style={styles.sidebarUser}>👨‍💼 {user?.name}</p>
        <hr style={styles.hr} />

        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'doctors', label: '👨‍⚕️ Doctors' },
          { key: 'patients', label: '🧑‍🤝‍🧑 Patients' },
          { key: 'appointments', label: '📅 Appointments' },
        ].map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.sidebarBtn,
              backgroundColor: activeTab === tab.key ? '#2b6cb0' : 'transparent',
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
            <h2 style={styles.heading}>📊 Dashboard Overview</h2>
            <div style={styles.cardRow}>
              <div style={{ ...styles.statCard, backgroundColor: '#ebf8ff' }}>
                <h3 style={{ color: '#2b6cb0' }}>👨‍⚕️ Doctors</h3>
                <p style={styles.statNumber}>{doctors.length}</p>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#f0fff4' }}>
                <h3 style={{ color: '#276749' }}>🧑‍🤝‍🧑 Patients</h3>
                <p style={styles.statNumber}>{patients.length}</p>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#fffaf0' }}>
                <h3 style={{ color: '#c05621' }}>📅 Appointments</h3>
                <p style={styles.statNumber}>{appointments.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <h2 style={styles.heading}>👨‍⚕️ All Doctors</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Specialization</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Available</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id} style={styles.tableRow}>
                    <td style={styles.td}>{doc.id}</td>
                    <td style={styles.td}>{doc.user?.name}</td>
                    <td style={styles.td}>{doc.specialization}</td>
                    <td style={styles.td}>{doc.department}</td>
                    <td style={styles.td}>{doc.phone}</td>
                    <td style={styles.td}>{doc.available ? '✅' : '❌'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeleteDoctor(doc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    <td colSpan="7" style={styles.noData}>No doctors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div>
            <h2 style={styles.heading}>🧑‍🤝‍🧑 All Patients</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((pat) => (
                  <tr key={pat.id} style={styles.tableRow}>
                    <td style={styles.td}>{pat.id}</td>
                    <td style={styles.td}>{pat.user?.name}</td>
                    <td style={styles.td}>{pat.gender}</td>
                    <td style={styles.td}>{pat.phone}</td>
                    <td style={styles.td}>{pat.bloodGroup}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDeletePatient(pat.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan="6" style={styles.noData}>No patients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 style={styles.heading}>📅 All Appointments</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} style={styles.tableRow}>
                    <td style={styles.td}>{apt.id}</td>
                    <td style={styles.td}>{apt.patient?.user?.name}</td>
                    <td style={styles.td}>{apt.doctor?.user?.name}</td>
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
                    <td style={styles.td}>
                      {apt.status !== 'CANCELLED' && (
                        <button
                          style={styles.deleteBtn}
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
                    <td colSpan="6" style={styles.noData}>No appointments found</td>
                  </tr>
                )}
              </tbody>
            </table>
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
    backgroundColor: '#1a365d',
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
    color: '#90cdf4',
    textAlign: 'center',
    fontSize: '14px',
  },
  hr: {
    borderColor: '#2d4a7a',
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
    marginTop: 'auto',
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
    backgroundColor: '#2b6cb0',
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
  deleteBtn: {
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
};

export default AdminDashboard;