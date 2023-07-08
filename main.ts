// import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { Data, Sender } from "./types.ts";
import { load } from "https://deno.land/std@0.173.0/dotenv/mod.ts"

const env = await load();
const host = env["HOST"] || "localhost";

const senders = new Map<string, Data[]>();
const receivers= new Map<string, WebSocket>();

Deno.serve(
  (req) => {
    const upgrade  = req.headers.get("upgrade");

    if (upgrade?.toLowerCase() !== "websocket") {
      return new Response("Not Websocket Upgrade", {status: 404});
    }

    const {socket, response} = Deno.upgradeWebSocket(req);
    console.log('New Socket Connection:', socket)
    const type = req.headers.get("sec-websocket-protocol")?.split(", ")[2];
    
    if (type?.toLowerCase() === "receiver") {
      const session = req.headers.get("sec-websocket-protocol")?.split(", ")[1]!;
      console.log(`${new Date()}: Received Receiver Connection from ${session}`)
      receivers.set(session, socket);
    }
    else if (req.headers.get("client")?.toLowerCase() === "sender") {
      console.log(`${new Date()}: Received sender connection session ${req.headers.get("session")}`)
      senders.set(req.headers.get("session")!, []);
    }

    socket.onopen = () => {
      console.log("socket opened: ", socket);
      const activeSessions = Array.from(senders.keys());
      const activeReceivers = Array.from(receivers.keys());
      console.log(`${new Date()}: Active Sender Sessions: ${activeSessions}`);
      console.log(`${new Date()}: Active Receiver Sessions: ${activeReceivers}`);
    };

    socket.onmessage = (message) => {
      const msg = JSON.parse(message.data);

      if ((msg as Sender).type.toLowerCase() === "sender") {
        senders.set((msg as Sender).session, (msg as Sender).data );
      }

      const receiver = receivers.get((msg as Sender).session);
      console.log()
      if (receiver) {
        console.log(receiver)
      }

      console.log(receiver)

      const data = senders.get((msg as Sender).session) 

      receiver?.send(JSON.stringify({
        event: 'controller_movement',
        data: data
      }));
    }

    socket.onclose = () => {
      console.log("socket closed");
      // console.log(event);
    };

    socket.onerror = () => {
      console.log("socket error");
      // console.log(event);
    }

    return response;
  },
)