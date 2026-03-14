'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IMaskInput } from 'react-imask';
import './styles/styles.css';

export default function Home() {
  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    paroquia_comunidade: '',
    movimento_pastoral: '',
    qual_movimento: '',
    grupo_oracao_rcc: '',
    qual_grupo_oracao: '',
    participou_retiro: '',
    autoriza_dados: false,
    autoriza_imagem: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'email') {
      const formattedEmail = value.toLowerCase().trim();
      setFormData({
        ...formData,
        [name]: formattedEmail,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'nome_completo',
      'data_nascimento',
      'telefone',
      'endereco',
      'cidade',
      'paroquia_comunidade',
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`O campo "${field.replace('_', ' ')}" é obrigatório.`);
        return false;
      }
    }
    if (formData.movimento_pastoral === 'sim' && !formData.qual_movimento) {
      alert('Por favor, informe o movimento pastoral.');
      return false;
    }
    if (formData.grupo_oracao_rcc === 'sim' && !formData.qual_grupo_oracao) {
      alert('Por favor, informe o grupo de oração RCC.');
      return false;
    }
    if (!formData.autoriza_dados) {
      alert('Você deve autorizar o uso dos dados para prosseguir.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Inscrição enviada com sucesso!');
        window.location.href = '/sucesso';
      } else {
        const errorData = await response.json();
        alert('Erro ao enviar inscrição: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar inscrição.');
    }
  };

  // Verificar se as inscrições estão fechadas (21:30 -03 de 31/05/2025)
  const isRegistrationClosed = new Date() > new Date('2026-12-06T18:30:00-03:00');

  return (
    <div className="container mt-8 mb-8">
      <Image
        src="/images/logo.png"
        alt="Logotipo"
        className="logo"
        width={300}
        height={200}
      />
      <p className="text-center mb-6">O Encontro das Duas Sedes.</p>
      <p className="text-center mb-6">06 de dezembro às 22h00<br/> Paróquia Nossa Senhora de Fátima - Vila Luizão</p>
      {isRegistrationClosed ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-red-600">Inscrições Fechadas</h1>
          <p className="mb-6">As inscrições para a II Vigília Jovem já foram encerradas. Agradecemos seu interesse!</p>
        </div>
      ) : (
        <>
          <h1>Inscrição</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group row">
              <div className="input-group name-input">
                <label htmlFor="nome_completo">Nome Completo</label>
                <input
                  type="text"
                  id="nome_completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  required
                  disabled={isRegistrationClosed}
                />
              </div>
              <div className="input-group">
                <label htmlFor="data_nascimento">Data de Nascimento</label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  required
                  disabled={isRegistrationClosed}
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isRegistrationClosed}
                />
              </div>
              <div className="input-group">
                <label htmlFor="telefone">Telefone/WhatsApp</label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onAccept={(value) => setFormData({ ...formData, telefone: value })}
                  placeholder="(99) 99999-9999"
                  required
                  disabled={isRegistrationClosed}
                  className="w-full p-2 mb-4 border rounded text-black"
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="input-group">
                <label htmlFor="endereco">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  disabled={isRegistrationClosed}
                />
              </div>
              <div className="input-group">
                <label htmlFor="cidade">Cidade</label>
                <select
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 border rounded text-black"
                  required
                  disabled={isRegistrationClosed}
                >
                  <option value="">Selecione sua cidade</option>
                  <option value="São Luís - MA">São Luís - MA</option>
                  <option value="São José de Ribamar - MA">São José de Ribamar - MA</option>
                  <option value="Paço do Lumiar - MA">Paço do Lumiar - MA</option>
                  <option value="Raposa - MA">Raposa - MA</option>
                </select>
              </div>
            </div>

            <div className="form-group row">
              <div className="input-group parish-input">
                <label htmlFor="paroquia_comunidade">Paróquia/Comunidade</label>
                <input
                  type="text"
                  id="paroquia_comunidade"
                  name="paroquia_comunidade"
                  value={formData.paroquia_comunidade}
                  onChange={handleChange}
                  required
                  disabled={isRegistrationClosed}
                />
              </div>
              <div className="form-group radio-group half-width">
                <label>Participa de algum movimento pastoral?</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="movimento_pastoral"
                      value="sim"
                      checked={formData.movimento_pastoral === 'sim'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Sim
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="movimento_pastoral"
                      value="nao"
                      checked={formData.movimento_pastoral === 'nao'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Não
                  </label>
                </div>
                {formData.movimento_pastoral === 'sim' && (
                  <div className="input-group movement-input">
                    <input
                      type="text"
                      name="qual_movimento"
                      placeholder="Qual?"
                      value={formData.qual_movimento}
                      onChange={handleChange}
                      required
                      disabled={isRegistrationClosed}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group row">
              <div className="form-group radio-group half-width">
                <label>Participa de grupo de oração RCC?</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="grupo_oracao_rcc"
                      value="sim"
                      checked={formData.grupo_oracao_rcc === 'sim'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Sim
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="grupo_oracao_rcc"
                      value="nao"
                      checked={formData.grupo_oracao_rcc === 'nao'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Não
                  </label>
                </div>
                {formData.grupo_oracao_rcc === 'sim' && (
                  <div className="input-group prayer-group-input">
                    <input
                      type="text"
                      name="qual_grupo_oracao"
                      placeholder="Qual?"
                      value={formData.qual_grupo_oracao}
                      onChange={handleChange}
                      required
                      disabled={isRegistrationClosed}
                    />
                  </div>
                )}
              </div>
              <div className="form-group radio-group half-width">
                <label>Já participou de algum retiro?</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="participou_retiro"
                      value="sim"
                      checked={formData.participou_retiro === 'sim'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Sim
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="participou_retiro"
                      value="nao"
                      checked={formData.participou_retiro === 'nao'}
                      onChange={handleChange}
                      disabled={isRegistrationClosed}
                    />
                    Não
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="autoriza_dados"
                  checked={formData.autoriza_dados}
                  onChange={handleChange}
                  required
                  disabled={isRegistrationClosed}
                />
                 Autorizo que meus dados sejam utilizados pela RCC apenas para recados sobre eventos, não sendo divulgados em outros meios.
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="autoriza_imagem"
                  checked={formData.autoriza_imagem}
                  onChange={handleChange}
                  disabled={isRegistrationClosed}
                />
                 Tenho ciência e autorizo o uso dos registros da minha imagem neste evento para fins de evangelização, divulgação e outras ações de marketing que venham ser realizadas pela RCC.
              </label>
            </div>

            <button type="submit" disabled={isRegistrationClosed}>
              Enviar Inscrição
            </button>
          </form>
        </>
      )}
    </div>
  );
}