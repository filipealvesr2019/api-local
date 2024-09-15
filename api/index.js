import express from 'express';
import app from '../app'; // Import your main app

const handler = (req, res) => app(req, res);

export default handler;
