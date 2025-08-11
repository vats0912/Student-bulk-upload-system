import amqp from 'amqplib';

let channel;
const EXCHANGE_NAME = 'students_exchange';
const QUEUE_NAME = 'students_queue';
const ROUTING_KEY = 'student.create';

export const connectToRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

  console.log(' Connected to RabbitMQ');
};

export const publishStudent = async (studentData) => {
  channel.publish(
    EXCHANGE_NAME,
    ROUTING_KEY,
    Buffer.from(JSON.stringify(studentData)),
    { persistent: true }
  );
};

export const consumeStudents = async (processStudentCallback) => {
  await channel.consume(
    'students_queue',
    async (msg) => {
      if (msg !== null) {
        await processStudentCallback(msg);  
        channel.ack(msg);                   
      }
    },
    { noAck: false }
  );
};
