"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cookBots, setCookBots] = useState(1);
  const [botStatuses, setBotStatuses] = useState([false]);

  // Add a normal order
  const addOrder = () => {
    setOrders((prev) => [
      ...prev,
      { id: Date.now(), type: "normal", time: new Date(), status: "pending" },
    ]);
  };

  // Add a VIP order
  const addVipOrder = () => {
    setOrders((prev) => [
      { id: Date.now(), type: "vip", time: new Date(), status: "pending" },
      ...prev.filter((order) => order.type === "vip"),
      ...prev.filter((order) => order.type === "normal"),
    ]);
  };

  // Add a cook bot
  const addCookBot = () => {
    setCookBots((prev) => prev + 1);
    setBotStatuses((prev) => [...prev, false]);
  };

  // Decrease a cook bot
  const decreaseCookBot = () => {
    if (cookBots > 1) {
      setCookBots((prev) => prev - 1);
      setBotStatuses((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const intervals = botStatuses.map((_, index) =>
      setInterval(() => {
        setOrders((prevOrders) => {
          const nextOrderIndex = prevOrders.findIndex(
            (order) => order.status === "pending" && order.type === "vip"
          );
          const fallbackOrderIndex =
            nextOrderIndex === -1
              ? prevOrders.findIndex((order) => order.status === "pending")
              : nextOrderIndex;

          if (fallbackOrderIndex !== -1) {
            const updatedOrders = [...prevOrders];
            const orderToProcess = updatedOrders[fallbackOrderIndex];

            if (orderToProcess && orderToProcess.status === "pending") {
              updatedOrders[fallbackOrderIndex].status = "processing";

              setBotStatuses((statuses) =>
                statuses.map((status, i) => (i === index ? true : status))
              );

              return updatedOrders;
            }
          }

          return prevOrders;
        });

        setTimeout(() => {
          setOrders((currentOrders) => {
            const orderToCompleteIndex = currentOrders.findIndex(
              (order) => order.status === "processing"
            );

            if (orderToCompleteIndex !== -1) {
              const completedOrder = currentOrders[orderToCompleteIndex];

              setCompletedOrders((prevCompleted) => {
                const isAlreadyCompleted = prevCompleted.some(
                  (order) => order.id === completedOrder.id
                );
                if (!isAlreadyCompleted) {
                  return [
                    ...prevCompleted,
                    { ...completedOrder, status: "completed" },
                  ];
                }
                return prevCompleted; // To Avoid duplicates completed orders submittee
              });

              return currentOrders.filter((_, i) => i !== orderToCompleteIndex);
            }

            setBotStatuses((statuses) =>
              statuses.map((status, i) => (i === index ? false : status))
            );

            return currentOrders;
          });
        }, 10000);
      }, 10000)
    );

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [botStatuses]);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        gap: "20px",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{ textAlign: "center", color: "#fffff", marginBottom: "2%" }}
        >
          Order Queue
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <button onClick={addOrder} style={buttonStyle}>
            Add Order
          </button>
          <button onClick={addVipOrder} style={buttonStyle}>
            Add VIP Order
          </button>
          <button onClick={addCookBot} style={buttonStyle}>
            Add Cook Bot
          </button>
          <button onClick={decreaseCookBot} style={buttonStyle}>
            Decrease Cook Bot
          </button>
        </div>
        <h2 style={{ color: "#fffff" }}>Cook Bots: {cookBots}</h2>
        <ul style={listStyle}>
          {botStatuses.map((status, index) => (
            <li key={index} style={listItemStyle}>
              <strong>Bot {index + 1}:</strong> {status ? "Active" : "Idle"}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ color: "#fffff" }}>Pending Orders:</h2>
        <ul style={listStyle}>
          {orders.map((order) => (
            <li key={order.id} style={listItemStyle}>
              <strong>
                {order.type === "vip" ? "V" : "N"}
                {order.id}
              </strong>{" "}
              - {order.time.toLocaleTimeString()} -{" "}
              <span
                style={{
                  color: order.status === "processing" ? "green" : "orange",
                }}
              >
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ color: "#fffff" }}>Completed Orders:</h2>
        <ul style={listStyle}>
          {completedOrders.map((order) => (
            <li key={order.id} style={listItemStyle}>
              <strong>
                {order.type === "vip" ? "V" : "N"}
                {order.id}
              </strong>{" "}
              - {order.time.toLocaleTimeString()} -{" "}
              <span style={{ color: "blue" }}>{order.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "5px 5px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "14px",
  margin: "0 5px",
};

const listStyle = {
  listStyleType: "none",
  padding: 0,
};

const listItemStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};
