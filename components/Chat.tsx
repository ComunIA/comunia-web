import { Stack, Textarea, Button, Icon, Grid, GridItem } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
import {
  MdMic,
  MdMicOff,
  MdSend,
  MdOutlineClose,
  MdRecordVoiceOver,
  MdVoiceOverOff,
} from 'react-icons/md';
import { useSpeechRecognition } from 'react-speech-kit';
import { speak } from 'utils/constants';
import _ from 'lodash';
import { deleteMessages, getChatMessages, sendChatMessage } from 'api/Api';
import { useCookies } from 'react-cookie';

export default function Chat({ reportIds }: { reportIds: string[] }) {
  const [cookies, setCookie] = useCookies(['api_key']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [aiTurn, setAiTurn] = useState(false);
  const [muteSpeak, setMuteSpeak] = useState(true);
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setCurrentMessage(currentMessage + result);
    },
  });

  useEffect(() => {
    async function a() {
      if (aiTurn) {
        const message = await sendChatMessage(currentMessage, reportIds, cookies.api_key);
        if (!muteSpeak) {
          speak(message);
        }
        setAiTurn(false);
      }
      const newMessages = await getChatMessages(reportIds, cookies.api_key);
      const dataMessages = _.flatMap<Message>(
        newMessages.map((x) => [
          new Message({ id: 0, senderName: 'Ciudadano', message: x[0] }),
          new Message({ id: 1, senderName: 'Asistente', message: x[1] }),
        ]),
      );
      setMessages(dataMessages);
    }
    a();
  }, [aiTurn, reportIds]);

  const sendMessage = async () => {
    if (!currentMessage) return;
    const newMessage = new Message({
      id: 0,
      senderName: 'Ciudadano',
      message: currentMessage,
    });
    setMessages([...messages, newMessage]);
    await setAiTurn(true);
    setCurrentMessage('');
  };

  const toggleRecord = () => {
    if (listening) {
      stop();
    } else {
      listen({ lang: 'es-MX' });
    }
  };
  const clearMessages = async () => {
    setMessages([]);
    setAiTurn(false);
    await deleteMessages(reportIds, cookies.api_key);
  };

  return (
    <Grid
      templateAreas={`"main" "footer"`}
      gridTemplateRows="1fr 60px"
      h="400px"
      gap={0}
      borderWidth={1}
    >
      <GridItem
        paddingX="5"
        style={{ overflowY: 'scroll', minHeight: '400px', width: '100%', minWidth: '100%' }}
        mx="auto"
        area="main"
        borderWidth={1}
      >
        <ChatFeed
          messages={messages}
          hasInputField={false}
          showSenderName
          bubblesCentered={false}
          bubbleStyles={{
            text: {
              fontSize: 16,
            },
            chatbubble: {
              width: 800,
              borderRadius: 10,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: 'teal',
            },
          }}
        />
      </GridItem>
      <GridItem area="footer">
        <Stack direction="row" spacing={0} style={{ width: '100%' }} mx="auto">
          <Button height="auto" borderRadius={0} colorScheme="blue" onClick={clearMessages}>
            <Icon as={MdOutlineClose} />
          </Button>
          <Button
            height="auto"
            borderRadius={0}
            colorScheme="red"
            onClick={() => setMuteSpeak(!muteSpeak)}
            variant={muteSpeak ? 'outline' : 'solid'}
          >
            <Icon as={muteSpeak ? MdVoiceOverOff : MdRecordVoiceOver} />
          </Button>
          <Textarea
            rows={1}
            variant="filled"
            resize="none"
            placeholder="Escribe algo..."
            size="lg"
            borderRadius={0}
            colorScheme="teal"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
          <Button
            height="auto"
            borderRadius={0}
            colorScheme="red"
            isDisabled={aiTurn}
            onClick={toggleRecord}
            variant={listening ? 'outline' : 'solid'}
          >
            <Icon as={listening ? MdMicOff : MdMic} />
          </Button>
          <Button
            height="auto"
            borderRadius={0}
            colorScheme="teal"
            onClick={sendMessage}
            isDisabled={!currentMessage || aiTurn || listening}
          >
            <Icon as={MdSend} />
          </Button>
        </Stack>
      </GridItem>
    </Grid>
  );
}
