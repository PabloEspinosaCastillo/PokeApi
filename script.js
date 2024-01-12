let pokeHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
    const start = Date.now();
    await getPokemon();
    console.log(`Time: ${Date.now() - start} ms`);

    // Cada vez que seleccionas Renovar Pokemon te saca una pareja nueva
    document.querySelector('#get-pokemon-btn').addEventListener('click', async () => {
        await getNewPokemon();
    })

    // Cada vez que selecionas el boton Lucha se elige un ganador aleatorio
    document.querySelector('#battle-btn').addEventListener('click', () => {
        battlePokemon();
    })
})

// Llama a la API para generar una pareja
const getPokemon = async () => {
    // Llama a la PokeAPi dos veces para generar una pareja aleatoria (hasta 1017)
    //**Aunque hay 1025 pokemons los ultimos sprites no estan disponibles 
    const randomNumberOne = getUniqueNumber(pokeHistory, 1017) + 1;
    const randomNumberTwo = getUniqueNumber(pokeHistory, 1017) + 1;

    // Para cada pokemon: 
    // Nombre, Sprite, Vida, Ataque, Nombre & Puntos de Poder de los 4 movs
    const pokeDataArr = await pokemonDataSync(randomNumberOne, randomNumberTwo);

    await renderPokemonSync(pokeDataArr);
}

//Llama a la api para generar lss dos constantes como pokemon
const pokemonDataSync = async (num1, num2) => {
    let pokeDataArr = [];
    const pokemonOne = await makeApiCall(num1);
    const pokemonTwo = await makeApiCall(num2);

    pokeDataArr.push(pokemonOne);
    pokeDataArr.push(pokemonTwo);

    return await pokeDataArr;
}

const renderPokemonSync = (pokeDataArr) => {
    displayPokemonData(pokeDataArr[0]);
    displayPokemonData(pokeDataArr[1]);
}

const getNewPokemon = async () => {
    document.querySelector('.data').innerHTML = '';
    const start2 = Date.now();
    await getPokemon();
    console.log(`Nuevos Pokémons: ${Date.now() - start2} ms`);
}

//Pelean 2 pokemons y devuelve 1 ganador (random)
const battlePokemon = () => {
    const randomNumber = Math.random();
    const battleResult = document.createElement('p');
    const battleHistory = document.querySelector('#history');
    const pokemonOne = document.querySelectorAll('.pokemon-name')[0].innerText;
    const pokemonTwo = document.querySelectorAll('.pokemon-name')[1].innerText;
    
    /*
    const attack = document.createElement('p')
    attack.innerText = `Ataque: ${data.data.stats[1].base_stat}`; 
    pokeContainer.appendChild(attack);
    */
   
    if (randomNumber < .5) {
        battleResult.innerText = `${pokemonOne} a ganado a  ${pokemonTwo}`;
        battleHistory.prepend(battleResult);
        getNewPokemon();
    } else {
        battleResult.innerText = `${pokemonTwo} a ganado a  ${pokemonOne}`
        battleHistory.prepend(battleResult);
        getNewPokemon();
    }
}

const getUniqueNumber = (history, max) => {
    const ranNum = Math.floor(Math.random() * max);
    if (!history.includes(ranNum)) {
        history.push(ranNum);
        return ranNum;
    } else {
        return getUniqueNumber(history, max);
    }
}

//Llama a la api, crear constantes para stats y movs
const makeApiCall = async (ranNum) => await axios.get(`https://pokeapi.co/api/v2/pokemon/${ranNum}`);
const makeMovesApiCall = async (url) => await axios.get(url);
const displayPokemonData = async (data) => {
    const pokeContainer = document.createElement('div');
    pokeContainer.setAttribute('class', 'pokeCard');
    const name = document.createElement('h3');
    name.setAttribute('class', 'pokemon-name');
    const img = document.createElement('img');
    const hp = document.createElement('p');
    const attack = document.createElement('p')
    const moves = document.createElement('p');

//Sacar los datos de la api para ponerselos a cada Pokemon
    name.innerText = data.data.name;
    img.src = data.data.sprites.front_default;
    hp.innerText = `Vida: ${data.data.stats[0].base_stat}`;
    attack.innerText = `Ataque: ${data.data.stats[1].base_stat}`;
    moves.innerText = 'Movimientos:';
   

    const container = document.querySelector('.data');
//Introducir cada dato en la caja
    pokeContainer.appendChild(name);
    pokeContainer.appendChild(img);
    pokeContainer.appendChild(hp);
    pokeContainer.appendChild(attack);
    pokeContainer.appendChild(moves);

    //Añade movimientos aleatorios
    let movesHistory = [];

    for (let i = 0; i < 4; i++) {
        const movesIndex = getUniqueNumber(movesHistory, data.data.moves.length);
        const move = document.createElement('p');
        const chosenMove = data.data.moves[movesIndex];
        const moveUrl = chosenMove.move.url;

        const movePowerPoints = await makeMovesApiCall(moveUrl);

        move.innerText = `${chosenMove.move.name} PP: ${movePowerPoints.data.pp}`;
        pokeContainer.appendChild(move);
    }

//A partir de 6a generacion aproximadamente esta funcion deja de funcionar con algunos 
//pokemon debido a que solo existen los sprites de frente en las ultimas generaciones

    if (data.data.sprites.back_default != null) {
        img.addEventListener('mouseover', () => {
            img.style.transition = '.3s ease';
            img.src = data.data.sprites.back_default;
        })
    }
    
    pokeContainer.addEventListener('mouseover', () => {
        pokeContainer.style.transform = 'scale(1.05)';
    })
    
    img.addEventListener('mouseleave', () => {
        img.style.transition = '.3s ease';
        img.src = data.data.sprites.front_default;
    })

    pokeContainer.addEventListener('mouseleave', () => {
        pokeContainer.style.transform = 'scale(1)';
    })

    container.appendChild(pokeContainer);
}