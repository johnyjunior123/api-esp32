# Necessidades

- Registro de repetição -> Quantas vezes as pessoas retornaram ao local
- Tempo que ficou no local
- Contar pessoas
- Cruzamentos dos pontos que passou

# Levantamento de Requisitos + Pensamento sobre o processo

- ESP32 envia a cada 45 segundos uma lista de macs todos os dispositivos ao redor.
- O servidor pega esses macs e salva no banco de dados com o seguinte:
  - mac -> Primary Key
  - last_update -> Ultima vez que ele esteve

## Novas ideias

Agora precisamos registrar o mac também de acordo com o local onde ele está e a quantidade de vezes

1º -> Adicionamos a propriedade repeats:
Que irá guardar a quantidade de vezes que o individuo saiu e retornou do evento/local.

Para isso devemos verificar se a ultima vez que ele foi coletado tem que ter uma diferença de no minimo (20 minutos) -> Pode mudar de acordo com levantamentos futuros.

Agora:
    - mac: string
    - last_update: Date
    - repeats: number

Porém, eu quero saber também o local, nesse caso podemos armazenar o local + referencia para o mac + repeats.

Ficando a entidade Relacionamento:

    1º -> Entidade dispositivo
        -> id: int incremental
        -> mac: string -> tamanho 17
        -> created: Date -> verifica quando ele aparece pela 1º vez
        -> last_update: Date -> verifica a ultima vez que ele aparece
        -> total_repeats -> quantas vezes ele foi identificado na cidade
    2º -> Passagens
        -> id: int incremental
        -> local: string
        -> aparelho: (talvez um token para cada um?)
        -> data: Date -> horario que ele foi identificado
        -> Referencia ao dispositivo