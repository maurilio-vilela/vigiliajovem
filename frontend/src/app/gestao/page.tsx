"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import './styles.css';

interface Inscricao {
  id: number;
  nome_completo: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  paroquia_comunidade: string;
  movimento_pastoral: boolean;
  qual_movimento: string | null;
  grupo_oracao_rcc: boolean;
  qual_grupo_oracao: string | null;
  participou_retiro: boolean;
  ip: string;
  dispositivo: string;
  navegador: string;
  url_inscricao: string;
}

export default function Gestao() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [selected, setSelected] = useState<Inscricao | null>(null);
  const [editing, setEditing] = useState<Inscricao | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Inscricao>('nome_completo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('Token armazenado no início:', storedToken);
    if (storedToken) {
      setToken(storedToken);
    } else {
      setErrorMessage('Nenhum token encontrado. Faça login novamente.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log('Resposta do login:', data);
      if (data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
        }
        setToken(data.token);
        console.log('Login bem-sucedido, novo token:', data.token);
      } else {
        setErrorMessage('Credenciais inválidas ou erro no servidor.');
        console.error('Erro no login - Dados recebidos:', data);
      }
    } catch (error) {
      setErrorMessage('Erro ao fazer login. Verifique sua conexão.');
      console.error('Erro ao fazer login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      setErrorMessage(null);
      console.log('Iniciando requisição de inscrições com token:', token);
      fetch('/api/inscricoes', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          console.log('Status da requisição /api/inscricoes:', res.status, res.statusText);
          if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status} - ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Dados recebidos da API:', data);
          if (Array.isArray(data)) {
            setInscricoes(data);
            setErrorMessage(null);
          } else {
            setErrorMessage('Dados inválidos recebidos da API. Esperado um array.');
            setInscricoes([]);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar inscrições:', error);
          setErrorMessage('Erro ao carregar inscrições. Verifique a API ou tente novamente.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
      try {
        const response = await fetch(`/api/inscricoes/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setInscricoes(inscricoes.filter((inscricao) => inscricao.id !== id));
          setSelected(null);
          alert('Inscrição excluída com sucesso!');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Erro ao excluir inscrição.');
        }
      } catch (error) {
        console.error('Erro ao excluir inscrição:', error);
        alert('Erro ao excluir inscrição. Verifique sua conexão.');
      }
    }
  };

  const handleEdit = (inscricao: Inscricao) => {
    setEditing({ ...inscricao });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      const response = await fetch(`/api/inscricoes/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing),
      });
      if (response.ok) {
        const updatedInscricao = await response.json();
        setInscricoes(
          inscricoes.map((inscricao) =>
            inscricao.id === updatedInscricao.id ? updatedInscricao : inscricao
          )
        );
        setEditing(null);
        setSelected(updatedInscricao);
        alert('Inscrição atualizada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao atualizar inscrição.');
      }
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      alert('Erro ao atualizar inscrição. Verifique sua conexão.');
    }
  };

  const handleSort = (field: keyof Inscricao) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedInscricoes = [...inscricoes].sort((a, b) => {
    const valueA = a[sortField]?.toString() || '';
    const valueB = b[sortField]?.toString() || '';
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedInscricoes.length / rowsPerPage);
  const paginatedInscricoes = sortedInscricoes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleExportPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const cellPadding = 2;
    let y = 40;

    const logoImg = document.createElement('img') as HTMLImageElement;
    logoImg.src = '/images/logo.png';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => {
        console.error('Erro ao carregar a imagem da logo');
        resolve();
      };
    });
    pdf.addImage(logoImg, 'PNG', margin, 10, 30, 15);

    pdf.setFont('arial', 'bold');
    pdf.setFontSize(16);
    pdf.text('Relatório de Inscrições', pageWidth / 2, 15, { align: 'center' });

    const columnPositions = [
      margin,
      margin + 10,
      margin + 65,
      margin + 95,
      margin + 125,
      margin + 155,
      margin + 195,
    ];
    const columnWidths = [10, 55, 30, 30, 30, 40, 70];

    const drawHeader = () => {
      pdf.setFont('arial', 'bold');
      pdf.setFontSize(11);
      pdf.text('Nº', columnPositions[0] + cellPadding, y);
      pdf.text('Nome', columnPositions[1] + cellPadding, y);
      pdf.text('Data Nascimento', columnPositions[2] + cellPadding, y);
      pdf.text('Cidade', columnPositions[3] + cellPadding, y);
      pdf.text('Telefone', columnPositions[4] + cellPadding, y);
      pdf.text('Paróquia/Comunidade', columnPositions[5] + cellPadding, y);
      pdf.text('Grupo Oração', columnPositions[6] + cellPadding, y);

      pdf.setLineWidth(0.5);
      pdf.line(margin, y + 3, pageWidth - margin, y + 3);
      for (let i = 0; i < columnPositions.length; i++) {
        pdf.line(columnPositions[i], y - 5, columnPositions[i], y + 3);
      }
      pdf.line(pageWidth - margin, y - 5, pageWidth - margin, y + 3);
      y += 3 + 7;
    };

    drawHeader();

    sortedInscricoes.forEach((inscricao, index) => {
      pdf.setFont('arial', 'normal');
      pdf.setFontSize(10);

      if (y > pageHeight - margin - 10) {
        pdf.addPage();
        y = 40;
        drawHeader();
        pdf.setFont('arial', 'normal');
        pdf.setFontSize(10);
      }

      const lines = [
        (index + 1).toString(),
        inscricao.nome_completo,
        formatDate(inscricao.data_nascimento),
        inscricao.cidade,
        formatPhone(inscricao.telefone),
        inscricao.paroquia_comunidade,
        inscricao.grupo_oracao_rcc ? inscricao.qual_grupo_oracao || 'Não informado' : 'Não',
      ];
      let maxLines = 1;

      for (let i = 0; i < lines.length; i++) {
        const textLines = pdf.splitTextToSize(lines[i], columnWidths[i] - 2 * cellPadding);
        if (textLines.length > maxLines) maxLines = textLines.length;
      }

      const rowHeight = (maxLines * 4) + 4;

      for (let i = 0; i < lines.length; i++) {
        const textLines = pdf.splitTextToSize(lines[i], columnWidths[i] - 2 * cellPadding);
        const textHeight = maxLines * 4;
        const yText = (y - 5) + cellPadding + ((rowHeight - textHeight) / 2);
        pdf.text(textLines, columnPositions[i] + cellPadding, yText);
      }

      pdf.setLineWidth(0.3);
      pdf.rect(margin, y - 5, pageWidth - 2 * margin, rowHeight);
      for (let i = 0; i < columnPositions.length; i++) {
        pdf.line(columnPositions[i], y - 5, columnPositions[i], y - 5 + rowHeight);
      }
      pdf.line(pageWidth - margin, y - 5, pageWidth - margin, y - 5 + rowHeight);

      y += rowHeight + 1;
    });

    pdf.line(margin, y + 2, pageWidth - margin, y + 2);

    pdf.save('relatorio_inscricoes.pdf');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-primary-black text-primary-white flex items-center justify-center p-4">
        <Form
          onSubmit={handleLogin}
          className="bg-primary-black p-4 md:p-6 rounded-lg shadow-lg"
          style={{ maxWidth: '450px', width: '90vw', height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <h2 className="text-xl md:text-2xl mb-3 md:mb-4 text-primary-orange font-bold text-center">Login - Área de Gestão</h2>
          {errorMessage && <p className="text-red-500 mb-3 text-center">{errorMessage}</p>}
          {isLoading && <p className="text-yellow-500 mb-3 text-center">Carregando...</p>}
          <div>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                required
                className="text-sm md:text-base"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="text-sm md:text-base"
              />
            </Form.Group>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary-orange text-primary-white hover:bg-primary-red text-sm md:text-base py-2"
            disabled={isLoading}
          >
            Entrar
          </Button>
        </Form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-black text-primary-white p-2 md:p-6">
      <div className="max-w-[90vw] mx-auto relative">
        <div className="flex flex-row justify-between items-center mb-3 md:mb-6">
          <Image
            src="/images/logo.png"
            alt="Logotipo Vigília Jovem"
            className="logo drop-shadow-lg"
            width={150}
            height={75}
            sizes="(max-width: 768px) 150px, 200px"
          />
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
              }
              setToken(null);
            }}
            className="btn btn-danger text-sm md:text-base py-1 md:py-2"
          >
            Sair
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-6 text-center md:text-left">Gestão de Inscrições</h1>
        <Button
          onClick={handleExportPDF}
          className="bg-primary-orange text-primary-white hover:bg-primary-red mb-3 md:mb-6 text-sm md:text-base py-1 md:py-2"
          style={{ borderRadius: '5px' }}
          disabled={isLoading || inscricoes.length === 0}
        >
          Exportar PDF
        </Button>

        {isLoading && <p className="text-yellow-500 mb-3 text-center">Carregando inscrições...</p>}
        {errorMessage && <p className="text-red-500 mb-3 text-center">{errorMessage}</p>}
        {inscricoes.length === 0 && !errorMessage && !isLoading && (
          <p className="text-yellow-500 mb-3 text-center">Nenhuma inscrição encontrada.</p>
        )}

        <div id="table-to-export" className="bg-primary-black rounded-lg shadow-lg">
          <Table striped bordered hover variant="dark" className="w-full responsive-table">
            <thead>
              <tr>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('id')}>
                  # {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('nome_completo')}>
                  Nome {sortField === 'nome_completo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('data_nascimento')}>
                  Data de Nascimento {sortField === 'data_nascimento' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('cidade')}>
                  Cidade {sortField === 'cidade' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('telefone')}>
                  Telefone {sortField === 'telefone' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('paroquia_comunidade')}>
                  Paróquia/Comunidade {sortField === 'paroquia_comunidade' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap" onClick={() => handleSort('qual_grupo_oracao')}>
                  Grupo de Oração {sortField === 'qual_grupo_oracao' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 md:p-3 font-semibold whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInscricoes.map((inscricao, index) => (
                <tr
                  key={inscricao.id}
                  onClick={() => setSelected(inscricao)}
                  style={{ cursor: 'pointer' }}
                  className="hover:bg-gray-800"
                >
                  <td className="p-2 md:p-3 whitespace-nowrap">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2 md:p-3 break-words">{inscricao.nome_completo}</td>
                  <td className="p-2 md:p-3 break-words">{formatDate(inscricao.data_nascimento)}</td>
                  <td className="p-2 md:p-3 break-words">{inscricao.cidade}</td>
                  <td className="p-2 md:p-3 break-words">{formatPhone(inscricao.telefone)}</td>
                  <td className="p-2 md:p-3 break-words">{inscricao.paroquia_comunidade}</td>
                  <td className="p-2 md:p-3 break-words">{inscricao.grupo_oracao_rcc ? inscricao.qual_grupo_oracao || 'Não informado' : 'Não'}</td>
                  <td className="p-2 md:p-3 whitespace-nowrap">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(inscricao);
                      }}
                      style={{ cursor: 'pointer', marginRight: '5px' }}
                    >
                      ✏️
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inscricao.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      ❌
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mt-3 md:mt-6 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-primary-white text-sm md:text-base">Linhas por página:</span>
            <Form.Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full md:w-auto text-sm md:text-base"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              variant="primary"
              className="text-sm md:text-base py-1 md:py-2"
            >
              Anterior
            </Button>
            <span className="text-primary-white text-sm md:text-base">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              variant="primary"
              className="text-sm md:text-base py-1 md:py-2"
            >
              Próxima
            </Button>
          </div>
        </div>

        <Modal show={!!selected} onHide={() => setSelected(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{selected?.nome_completo}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Data de Nascimento:</strong> {formatDate(selected?.data_nascimento || '')}</p>
            <p><strong>E-mail:</strong> {selected?.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {formatPhone(selected?.telefone || '')}</p>
            <p><strong>Endereço:</strong> {selected?.endereco}</p>
            <p><strong>Cidade:</strong> {selected?.cidade}</p>
            <p><strong>Paróquia/Comunidade:</strong> {selected?.paroquia_comunidade}</p>
            <p><strong>Movimento/Pastoral:</strong> {selected?.movimento_pastoral ? selected.qual_movimento : 'Não'}</p>
            <p><strong>Grupo de Oração RCC:</strong> {selected?.grupo_oracao_rcc ? selected.qual_grupo_oracao : 'Não'}</p>
            <p><strong>Participou de Retiro:</strong> {selected?.participou_retiro ? 'Sim' : 'Não'}</p>
            <p><strong>IP:</strong> {selected?.ip}</p>
            <p><strong>Dispositivo:</strong> {selected?.dispositivo}</p>
            <p><strong>Navegador:</strong> {selected?.navegador}</p>
            <p><strong>URL de Inscrição:</strong> {selected?.url_inscricao}</p>
          </Modal.Body>
        </Modal>

        <Modal show={!!editing} onHide={() => setEditing(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Inscrição</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSaveEdit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo</Form.Label>
                <Form.Control
                  type="text"
                  value={editing?.nome_completo || ''}
                  onChange={(e) => setEditing({ ...editing!, nome_completo: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Data de Nascimento</Form.Label>
                <Form.Control
                  type="date"
                  value={editing?.data_nascimento.split('T')[0] || ''}
                  onChange={(e) => setEditing({ ...editing!, data_nascimento: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={editing?.email || ''}
                  onChange={(e) => setEditing({ ...editing!, email: e.target.value })}
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="text"
                  value={editing?.telefone || ''}
                  onChange={(e) => setEditing({ ...editing!, telefone: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Endereço</Form.Label>
                <Form.Control
                  type="text"
                  value={editing?.endereco || ''}
                  onChange={(e) => setEditing({ ...editing!, endereco: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Cidade</Form.Label>
                <Form.Control
                  type="text"
                  value={editing?.cidade || ''}
                  onChange={(e) => setEditing({ ...editing!, cidade: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Paróquia/Comunidade</Form.Label>
                <Form.Control
                  type="text"
                  value={editing?.paroquia_comunidade || ''}
                  onChange={(e) => setEditing({ ...editing!, paroquia_comunidade: e.target.value })}
                  required
                  className="text-sm md:text-base"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Movimento/Pastoral</Form.Label>
                <Form.Select
                  value={editing?.movimento_pastoral.toString() || 'false'}
                  onChange={(e) =>
                    setEditing({
                      ...editing!,
                      movimento_pastoral: e.target.value === 'true',
                      qual_movimento: e.target.value === 'false' ? null : (editing?.qual_movimento ?? null),
                    })
                  }
                  className="text-sm md:text-base"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Form.Select>
                {editing?.movimento_pastoral && (
                  <Form.Control
                    type="text"
                    value={editing.qual_movimento || ''}
                    onChange={(e) => setEditing({ ...editing!, qual_movimento: e.target.value })}
                    placeholder="Qual?"
                    className="mt-2 text-sm md:text-base"
                    required
                  />
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Grupo de Oração RCC</Form.Label>
                <Form.Select
                  value={editing?.grupo_oracao_rcc.toString() || 'false'}
                  onChange={(e) =>
                    setEditing({
                      ...editing!,
                      grupo_oracao_rcc: e.target.value === 'true',
                      qual_grupo_oracao: e.target.value === 'false' ? null : (editing?.qual_grupo_oracao ?? null),
                    })
                  }
                  className="text-sm md:text-base"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Form.Select>
                {editing?.grupo_oracao_rcc && (
                  <Form.Control
                    type="text"
                    value={editing.qual_grupo_oracao || ''}
                    onChange={(e) => setEditing({ ...editing!, qual_grupo_oracao: e.target.value })}
                    placeholder="Qual?"
                    className="mt-2 text-sm md:text-base"
                    required
                  />
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Participou de Retiro</Form.Label>
                <Form.Select
                  value={editing?.participou_retiro.toString() || 'false'}
                  onChange={(e) => setEditing({ ...editing!, participou_retiro: e.target.value === 'true' })}
                  className="text-sm md:text-base"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Form.Select>
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100 text-sm md:text-base py-2" disabled={isLoading}>
                Salvar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}