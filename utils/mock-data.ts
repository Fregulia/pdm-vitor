// CRIA A INTERFACE STUDENT
export interface Student {
  id: number;
  name: string;
  nextClass: string;
  birthday: string; 
}

// ARRAY DE NOMES
const firstNames = [
  "Ana",
  "Bruno",
  "Carlos",
  "Daniela",
  "Eduardo",
  "Fernanda",
  "Gabriel",
  "Helena",
  "Igor",
  "Juliana",
  "Lucas",
  "Mariana",
  "Nicolas",
  "Olivia",
  "Pedro",
  "Quintino",
  "Rafael",
  "Sofia",
  "Thiago",
  "Ursula",
  "Victor",
  "Wanessa",
  "Xavier",
  "Yasmin",
  "Zeca",
  "Alice",
  "Bento",
  "Caio",
  "Dora",
];

// ARRAY DE SOBRENOMES
const lastNames = [
  "Silva",
  "Souza",
  "Costa",
  "Santos",
  "Oliveira",
  "Pereira",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Lima",
  "Araujo",
  "Fernandes",
  "Ribeiro",
  "Gomes",
  "Martins",
  "Rocha",
  "Carvalho",
  "Melo",
  "Barbosa",
  "Lopes",
];

// PEGA UM ITEM ALEATÓRIO DE UM ARRAY
const getRandomItem = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

// PEGA UMA DATA ALEATÓRIA ENTRE DUAS DATAS
const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// FUNÇÃO QUE FAZ OS MOCKS
export const makeMockStudents = (count: number): Student[] => {
  const students: Student[] = [];
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  
  for (let i = 1; i <= count; i++) {

    // ITERA NOS ARRAYS DE NOMES E SOBRENOMES
    const name = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;

    // CHANCE DE TER AULA NOS PRÓXIMOS 2 DIAS
    const hasClassSoon = Math.random() < 0.7;
    let nextClassDate = new Date();
    if (hasClassSoon) {
      // GERA UMA DATA DE AULA PRÓXIMA
      const dayOffset = Math.floor(Math.random() * 3); // 0, 1, ou 2
      // SETA A DATA DA PRÓXIMA AULA
      nextClassDate.setDate(today.getDate() + dayOffset);
    } else {
  
      nextClassDate.setDate(
        today.getDate() + Math.floor(Math.random() * 30) + 3
      );
    }

    // GERA UMA DATA DE ANIVERSÁRIO ALEATÓRIA NO ÚLTIMO ANO
    const birthDate = getRandomDate(
      new Date(today.getFullYear(), today.getMonth() - 11, 1),
      nextMonth
    );

    // ADICIONA O ALUNO AO ARRAY
    students.push({
      id: i,
      name: name,
      nextClass: nextClassDate.toISOString(),
      birthday: birthDate.toISOString(),
    });
  }
  return students;
};
