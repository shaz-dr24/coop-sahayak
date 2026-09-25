# Coop Sahayak

### AI-Powered Multilingual Cooperative Assistance Kiosk for Farmers

Coop Sahayak is an AI-powered, multilingual, voice-first kiosk designed to help farmers and rural citizens access cooperative services, government schemes, and grievance support through a simple ATM-style interface.

The system combines **voice interaction, multilingual AI, Retrieval-Augmented Generation (RAG), government document knowledge bases, grievance management, and text-to-speech** to provide accessible assistance without requiring users to be comfortable with conventional digital applications.

---

## Overview

Farmers often face difficulties accessing government schemes and cooperative services because of:

- Language barriers
- Limited digital literacy
- Difficulty navigating online portals
- Lack of awareness about government schemes
- Complex grievance submission processes
- Difficulty understanding official documents

**Coop Sahayak** addresses these challenges by providing a familiar kiosk-based experience with large buttons, voice interaction, multilingual support, and guided workflows.

### Core Idea

> **Instead of asking farmers to learn a digital interface, Coop Sahayak adapts the interface to the farmer.**

A farmer can interact with the system using:

- Voice
- Touch
- Multiple Indian languages
- Guided conversations
- Physical-style kiosk controls

---

# Key Features

## 1. Multilingual AI Assistant

Coop Sahayak supports multilingual interaction for rural users.

Supported languages include:

- English
- Tamil
- Hindi
- Telugu

The system detects the user's language and processes the request accordingly.

---

## 2. Voice-First Interaction

Users can interact with Coop Sahayak using voice.

### Speech-to-Text

The system converts spoken input into text using the voice processing pipeline.

### Text-to-Speech

AI-generated responses can be converted back into speech so users can listen to the answer instead of reading it.

This is especially useful for users with limited literacy or difficulty navigating text-heavy interfaces.

---

## 3. Government Scheme Assistance

Coop Sahayak provides information about cooperative and agricultural services using a curated knowledge base.

The current knowledge base includes information related to:

- PMFBY
- KCC / Agricultural Credit
- PACS
- Cooperative schemes
- Grievance mechanisms

The system uses official government documents as the primary knowledge sources.

---

## 4. Retrieval-Augmented Generation (RAG)

Instead of allowing the AI model to freely generate answers, Coop Sahayak retrieves relevant information from the project's knowledge base before generating a response.

### RAG Pipeline

```text
User Question
      ↓
Language Detection
      ↓
Intent Classification
      ↓
Topic / Service Detection
      ↓
Knowledge Retrieval
      ↓
Relevant Government Documents
      ↓
AI Response Generation
      ↓
User
