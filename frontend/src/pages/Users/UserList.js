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

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      <Card>
        <div className='d-flex justify-content-between align-items-center p-3'>
          <h2>Lista de Usuarios</h2>
          <Button variant="primary" onClick={handleShowCreate}>
            Crear Usuario
          </Button>
        </div>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Button 
                      onClick={() => handleDeleteUser(user.id)}
                      variant="danger"
                      className="me-2"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                    <Button 
                      variant="info" 
                      onClick={() => handleShowEdit(user)}
                      size="sm"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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