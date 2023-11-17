const express = require('express');
const axios = require('axios');
const routes = express();
const cors = require('cors');
routes.use(cors());

const {apiKey, apiKey1, apiKey2} = require('./connection');

function traduzirMETAR(metarObj) {
    const { mens } = metarObj;
  
    // Expressões regulares para extrair informações comuns de um METAR
    const pressaoAtmosfericaRegex = /Q(\d{4})/; // QNH (pressão atmosférica)
    const direcaoVentoRegex = /(\d{3})\d{2}KT/; // Direção do vento
    const temperaturaRegex = /(\d{2})\/(\d{2})/; // Temperatura (Celsius)
    const nuvensRegex = /(?:FEW|SCT|BKN|OVC|CAVOK)/;
    const visibilidadeRegex = /(\d{4})/; // Visibilidade em metros
  
    
    function traduzirDirecaoVento(graus) {
      const direcoesCardeais = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
      const index = Math.round(graus / 45) % 8;
      return direcoesCardeais[index];
    }
    function traduzirCondicionesNuvens(condicoesNuvens) {
      switch (condicoesNuvens) {
        case 'FEW':
          return 'Poucas nuvens';
        case 'SCT':
          return 'Nuvens dispersas';
        case 'BKN':
          return 'Nuvens quebradas';
        case 'OVC':
          return 'Nublado';
        case 'CAVOK':
            return 'Condições meteorológicas no aeroporto estão boas, sem obstruções para a visibilidade (visibilidade igual ou superior a 10 km) e sem limitações significativas na cobertura de nuvens.'
        default:
          return 'Condições de nuvens não reconhecidas';
      }
    }
    function traduzirVisibilidade(visibilidade) {
            const visibilidadeEmMetros = parseInt(visibilidade);
            if (visibilidadeEmMetros >= 5000) {
                return `${visibilidade} metros: Excelente`;
            } else if (visibilidadeEmMetros >= 1500) {
                return `${visibilidade} metros: Muito Boa`;
            } else if (visibilidadeEmMetros >= 500) {
                return `${visibilidade} metros: Boa`;
            } else if (visibilidadeEmMetros >= 200) {
                return `${visibilidade} metros: Moderada`;
            } else if (visibilidadeEmMetros >= 50) {
                return `${visibilidade} metros: Ruim`;
            } else if (visibilidadeEmMetros >= 10) {
                return `${visibilidade} metros: Muito Ruim`;
            } else {
                return `${visibilidade} metros: Péssima`;
            }
        
    }
  
    const pressaoMatches = mens.match(pressaoAtmosfericaRegex);
    const direcaoVentoMatches = mens.match(direcaoVentoRegex);
    const temperaturaMatches = mens.match(temperaturaRegex);
    const nuvensMatches = mens.match(nuvensRegex);
    const visibilidadeMatches = mens.match(visibilidadeRegex);
  
    const pressaoAtmosferica = pressaoMatches ? `${pressaoMatches[1]} hPa` : 'Pressão não encontrada';
    const direcaoVento = direcaoVentoMatches ? `${traduzirDirecaoVento(parseInt(direcaoVentoMatches[1]))}` : 'Direção do vento não encontrada';
    const temperatura = temperaturaMatches ? `${temperaturaMatches[1]}°C / ${temperaturaMatches[2]}°C` : 'Temperatura não encontrada';
    const nuvens = nuvensMatches ? `${traduzirCondicionesNuvens(nuvensMatches[0])}` : null;
    const visibilidade = visibilidadeMatches ? traduzirVisibilidade(visibilidadeMatches[1]) : null;
    const direcaoDoVento = direcaoVento; 
  
    return {
      pressaoAtmosferica,
      temperatura,
      nuvens,
      visibilidade,
      direcaoDoVento
    };
}

routes.get('/info-aeroportos/:aeroporto', async (req, res) => {
    const airport = req.params.aeroporto;

    try {
        const response = await axios.get(`https://api-redemet.decea.mil.br/aerodromos/?api_key=${apiKey}&pais=${airport}`);
        const array = response.data.data

        if(array.length<1){
           return res.json("aeroporto não encontrado.")
        }

        const airports = array.map(({ nome, cidade, cod }) => ({ nome, cidade, cod }));
        const holeAnswer={
            totalDeAeroportosEncontrados: array.length,
            Aeroportos:airports
        }

        res.json(holeAnswer);
       
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
});
routes.get('/info-meteorologica/:cod', async (req, res) => {
    const cod = req.params.cod;

    try {
        const responseMens = await axios.get(`https://api-redemet.decea.mil.br/mensagens/metar/${cod}?api_key=${apiKey}`);
        const responseStatus= await axios.get(`https://api-redemet.decea.mil.br/aerodromos/status/localidades/${cod}?api_key=${apiKey}`)
        const status=responseStatus.data.data[0][4]

        delete responseMens.data.data.data[0].id_localidade
        delete responseMens.data.data.data[0].validade_inicial
        
        const mensTraduzida = traduzirMETAR(responseMens.data.data.data[0]);
        
        if(status=='g'){
            mensTraduzida.status='great'
        }
        if(status=='y'){
            mensTraduzida.status='yellow'
        }
        if(status=='r'){
            mensTraduzida.status='red'
        }
        responseMens.data.data.data[0].mensagem= mensTraduzida
        
        res.json(responseMens.data.data.data[0]);
    } catch (error) {
        
        res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
});
routes.get(`/pesquisa`,async (req, res)=>{
    const{state, key_word, data}= req.body
   try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${state}${' '}${key_word}&from=${data}&sortBy=publishedAt&apiKey=${apiKey1}`);
    const newsData = response.data.articles;

        const dataDescription = newsData.map((i) => {
            return i.description
        })
        const dataAuthor = newsData.map((i) => {
            return i.author
        })
        const dataUrl = newsData.map((i) => {
            return i.url
        })
        const objet={
            dataAuthor,
            dataDescription,
            url: dataUrl
        }
    return res.json(objet)
   } catch (error) {
    res.status(500).json({mensagem:"erro interno do servidor"})
    return console.log(error)
   }
})
routes.get(`/real-time-flights`, async (req, res)=>{
   try {
    const response = await axios.get(`http://api.aviationstack.com/v1/flights?access_key=${apiKey2}`)
   
    const teste2= response.data.data.filter((j)=>{
        return j.departure
    })
    return res.json(teste2)

   } catch (error) {
    res.status(500).json({mensagem:"erro interno do servidor"})
    return console.log(error)
   }
})

module.exports = routes;
