import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, Button, Table } from 'react-bootstrap';
import UserApi from '../../api/UserApi';
import CreateUserModal from '../Users/CreateUserModal';
import EditUserModal from '../Users/EditUserModal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserApi.fetchUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')){
      try {
        await UserApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleShowCreate = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
  };

  const handleShowEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleUserCreated = () => {
    fetchUsers();
    handleCloseCreate();
  };

  const handleUserUpdated = () => {
    fetchUsers();
    handleCloseEdit();
  };

  if (loading) return <div className="text-center p-4">Cargando usuarios...</div>;
  if (error) return <div className="alert alert-danger m-3">Error: {error}</div>;

  return (
    <Container fluid className="p-0">
      <Card className="border-0 shadow-sm">
        <div className='d-flex justify-content-between align-items-center p-4 bg-light border-bottom'>
          <div>
            <h2 className="mb-1">Lista de Usuarios</h2>
            <small className="text-muted">Gestiona los usuarios del sistema</small>
          </div>
          <Button variant="primary" onClick={handleShowCreate} className="px-4">
            + Crear Usuario
          </Button>
        </div>
        
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th width="200">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      <span className="badge bg-secondary">{index + 1}</span>
                    </td>
                    <td className="fw-medium">{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge bg-info">{user.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'bg-success' : 'bg-warning'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => handleShowEdit(user)}
                          size="sm"
                          className="flex-fill"
                        >
                          Editar
                        </Button>
                        <Button 
                          onClick={() => handleDeleteUser(user.id)}
                          variant="outline-danger"
                          size="sm"
                          className="flex-fill"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center p-5">
              <p className="text-muted mb-3">No hay usuarios registrados</p>
              <Button variant="primary" onClick={handleShowCreate}>
                Crear primer usuario
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear usuario */}
      <CreateUserModal
        show={showCreateModal}
        onHide={handleCloseCreate}
        onUserCreated={handleUserCreated}
      />

      {/* Modal para editar usuario */}
      <EditUserModal
        show={showEditModal}
        onHide={handleCloseEdit}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />
    </Container>
  );
};

export default UserList;