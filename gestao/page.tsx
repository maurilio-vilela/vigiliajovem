'use client';

import { useState, useEffect } from 'react';

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/gojesuseosenhor/vigiliajovem/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } else {
      alert('Credenciais inválidas');
    }
  };

  useEffect(() => {
    if (token) {
      fetch('/gojesuseosenhor/vigiliajovem/api/inscricoes', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setInscricoes(data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-primary-black text-primary-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-primary-black p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl mb-4">Login</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuário"
            className="w-full p-2 mb-4 border rounded text-black"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full p-2 mb-4 border rounded text-black"
            required
          />
          <button type="submit" className="w-full bg-primary-orange text-primary-white p-2 rounded hover:bg-primary-red">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-black text-primary-white min-h-screen">
      <h1 className="text-2xl mb-4">Gestão de Inscrições</h1>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          setToken(null);
        }}
        className="mb-4 bg-primary-red text-primary-white px-4 py-2 rounded hover:bg-primary-orange"
      >
        Sair
      </button>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary-black">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Data de Nascimento</th>
              <th className="p-2 border">Cidade</th>
              <th className="p-2 border">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((inscricao) => (
              <tr
                key={inscricao.id}
                onClick={() => setSelected(inscricao)}
                className="cursor-pointer hover:bg-primary-black border-b"
              >
                <td className="p-2 border">{inscricao.nome_completo}</td>
                <td className="p-2 border">{inscricao.data_nascimento}</td>
                <td className="p-2 border">{inscricao.cidade}</td>
                <td className="p-2 border">{inscricao.telefone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-primary-black p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl mb-4">{selected.nome_completo}</h2>
            <p><strong>Data de Nascimento:</strong> {selected.data_nascimento}</p>
            <p><strong>E-mail:</strong> {selected.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> {selected.telefone}</p>
            <p><strong>Endereço:</strong> {selected.endereco}</p>
            <p><strong>Cidade:</strong> {selected.cidade}</p>
            <p><strong>Paróquia/Comunidade:</strong> {selected.paroquia_comunidade}</p>
            <p><strong>Movimento/Pastoral:</strong> {selected.movimento_pastoral ? selected.qual_movimento : 'Não'}</p>
            <p><strong>Grupo de Oração RCC:</strong> {selected.grupo_oracao_rcc ? selected.qual_grupo_oracao : 'Não'}</p>
            <p><strong>Participou de Retiro:</strong> {selected.participou_retiro ? 'Sim' : 'Não'}</p>
            <p><strong>IP:</strong> {selected.ip}</p>
            <p><strong>Dispositivo:</strong> {selected.dispositivo}</p>
            <p><strong>Navegador:</strong> {selected.navegador}</p>
            <p><strong>URL de Inscrição:</strong> {selected.url_inscricao}</p>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-primary-red text-primary-white px-4 py-2 rounded hover:bg-primary-orange"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}