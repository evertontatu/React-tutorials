import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioLivro extends Component {

  constructor() {
    super();
    this.state = {titulo:'',preco:'',autorId:''};
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);
    this.enviaForm = this.enviaForm.bind(this);
  }

  setTitulo(evento){
    this.setState({titulo:evento.target.value});
  }

  setPreco(evento){
    this.setState({preco:evento.target.value});
  }

  setAutorId(evento){
    this.setState({autorId:evento.target.value});
  }

  enviaForm(evento){
    evento.preventDefault();
    var titulo = this.state.titulo.trim();
    var preco = this.state.preco.trim();
    var autorId = this.state.autorId;

    $.ajax({
      url:'http://localhost:8080/api/livros',
      contentType:'application/json',
      dataType:'json',
      type:'POST',
      data: JSON.stringify({titulo:titulo,preco:preco,autorId:autorId}),
      success: function(novaListagem){
        PubSub.publish('atualiza-lista-livros',novaListagem);
        this.setState({titulo:'',preco:'',autorId:''});
      },
      error: function(resposta){
        if(resposta.status === 400) {
          new TratadorErros().publicaErros(resposta.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish("limpa-erros",{});
      }
    });
    this.setState({titulo: '', preco: '', autorId: ''});
  }

    render() {
      var autores = this.props.autores.map(function(autor){
        return <option key={autor.id} value={autor.id}>{autor.nome}</option>;
      });
      return (
          <div className="pure-form pure-form-aligned">
            <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm}>
              <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título"/>
              <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>

              <div className="pure-control-group">
                <label htmlFor="autorId">Autor</label>
                <select value={this.state.autorId} name="autorId" id="autorId" onChange={this.setAutorId}>
                  <option value="">Selecione autor</option>
                  {autores}
                </select>
              </div>

              <div className="pure-control-group">
                <label></label>
                <button type="submit" className="pure-button pure-button-primary">Gravar</button>
              </div>
            </form>
          </div>
      );
    }
}

class TabelaLivros extends Component {

    render() {
        var livros = this.props.lista.map(function(livro){
        return(
            <tr key={livro.titulo}>
              <td>{livro.titulo}</td>
              <td>{livro.autor.nome}</td>
              <td>{livro.preco}</td>
            </tr>
          );
        });
        return(
          <div>
            <table className="pure-table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Preco</th>
                  <th>Autor</th>
                </tr>
              </thead>
              <tbody>
                {livros}
              </tbody>
            </table>
          </div>
        );
    }
}

export default class LivroBox extends Component {

  constructor() {
    super();
    this.state = {lista : [],autores : []};
  }

  componentDidMount(){
    $.ajax({
        url:"http://localhost:8080/api/livros",
        dataType: 'json',
        success:function(resposta){
          this.setState({lista:resposta});
        }.bind(this)
      }
    );
    $.ajax({
        url:"http://localhost:8080/api/autores",
        dataType: 'json',
        success:function(resposta){
          this.setState({autores:resposta});
        }.bind(this)
      }
    );

    PubSub.subscribe('atualiza-lista-livros',function(topico,novaLista){
      this.setState({lista:novaLista});
    }.bind(this));
  }


  render(){
    return (
      <div>
        <div className="header">
          <h1>Cadastro de livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro autores={this.state.autores}/>
          <TabelaLivros lista={this.state.lista}/>
        </div>
      </div>
    );
  }
}
