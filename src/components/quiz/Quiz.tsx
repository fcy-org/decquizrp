import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";
import OptionButton from "./OptionButton";
import QuizButton from "./QuizButton";
import QuizInput from "./QuizInput";
import WaveDecoration from "./WaveDecoration";
import logo from "../assets/logo.png";

declare function fbq(...args: unknown[]): void;

const TOTAL_STEPS = 10;
const CRM_URL = "https://salesyscrm.vercel.app/api/public/leads";
const LEAD_CAPTURE_KEY = "braveo-principal-pixel-001";
const SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbyP-QbHP8R7abyDzqHiG3g-k8YmJhRrWk9rDeCpxEsPwROi82c5P1OfIzPO0paQa6Xo4Q/exec";
const WHATSAPP_NUMBER = "558694271798";

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

type Answers = {
  faturamento: string;
  dor: string;
  desempenho: string;
  produtos: string[];
  mediaFaturamento: string;
  compraDistribuidora: string;
  estado: string;
  cidade: string;
  nomeFarmacia: string;
  nomeUsuario: string;
  usaRedes: string;
  redesSociais: string;
  nomeCompleto: string;
  email: string;
  cnpj: string;
  telefone: string;
};

function validarCNPJ(cnpj: string): boolean {
  const s = cnpj.replace(/\D/g, "");
  if (s.length !== 14) return false;
  if (/^(\d)\1+$/.test(s)) return false;

  const calc = (len: number) => {
    let sum = 0;
    let w = len - 7;
    for (let i = 0; i < len; i++) {
      sum += parseInt(s[i], 10) * w--;
      if (w < 2) w = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  return calc(12) === parseInt(s[12], 10) && calc(13) === parseInt(s[13], 10);
}

function getUTMs() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content: p.get("utm_content") || "",
    utm_term: p.get("utm_term") || "",
  };
}

function getFbclid() {
  const p = new URLSearchParams(window.location.search);
  return p.get("fbclid") || "";
}

function normalizeState(value: string) {
  const normalized = value.trim().toUpperCase();
  return normalized === "PI" || normalized === "MA" ? normalized : "";
}

function updateQuizHash(step: number) {
  const nextHash = `#etapa-${step}`;

  if (window.location.hash === nextHash) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, "", nextUrl);
}

function trackQuizStep(step: number) {
  try {
    updateQuizHash(step);

    if (typeof fbq !== "function") {
      return;
    }

    fbq("trackCustom", "QuizStepView", {
      quiz_name: "rio_piranhas_diagnostico",
      step_number: step,
      step_name: `etapa-${step}`,
      step_url: `${window.location.pathname}${window.location.search}#etapa-${step}`,
    });

    fbq("trackCustom", `Quiz_Etapa_${step}`, {
      quiz_name: "rio_piranhas_diagnostico",
      step_number: step,
    });
  } catch (error) {
    console.error("Meta Pixel step tracking error", error);
  }
}
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type DiagnosisInsight = {
  icon: string;
  title: string;
  text: string;
  highlight?: boolean;
};

function getDiagnosisInsights(answers: Answers, name: string): DiagnosisInsight[] {
  const insights: DiagnosisInsight[] = [];

  // Insight 1: oportunidade principal — faturamento atual × desempenho em higiene
  if (answers.faturamento === "Medicamentos") {
    if (answers.desempenho === "Vendo pouco") {
      insights.push({
        icon: "⚠️",
        title: "Dependência alta de medicamentos",
        text: `${name}, sua farmácia ainda depende muito de medicamentos — categoria de margem baixa e alta concorrência. Higiene e beleza pode representar até 30% a mais no seu faturamento, com margens muito superiores.`,
        highlight: true,
      });
    } else if (answers.desempenho === "Poderia melhorar") {
      insights.push({
        icon: "📈",
        title: "Potencial de crescimento identificado",
        text: `${name}, você tem base sólida em medicamentos, mas higiene e beleza ainda não está rendendo o que poderia. Com os produtos e a estratégia certos, é possível ampliar esse canal em até 40% em poucos meses.`,
        highlight: true,
      });
    } else {
      insights.push({
        icon: "🚀",
        title: "Você já está no caminho certo",
        text: `${name}, ótimo sinal — você já vende bem em higiene mesmo tendo medicamentos como base. Agora é hora de escalar esse canal com produtos de alto giro e melhor margem.`,
        highlight: true,
      });
    }
  } else if (answers.faturamento === "Perfumaria e higiene") {
    if (answers.desempenho === "Vende muito bem") {
      insights.push({
        icon: "🏆",
        title: "Perfil de alta performance",
        text: `${name}, sua farmácia já tem o foco certo — higiene e beleza gera ticket médio mais alto. O próximo passo é otimizar o mix e o abastecimento para maximizar vendas sem rupturas.`,
        highlight: true,
      });
    } else {
      insights.push({
        icon: "💡",
        title: "Oportunidade de consistência",
        text: `${name}, higiene e beleza é seu foco, mas o desempenho ainda pode melhorar. Provavelmente é uma questão de mix de produtos ou estratégia de exposição — algo resolvível rapidamente com os fornecedores certos.`,
        highlight: true,
      });
    }
  } else {
    insights.push({
      icon: "💡",
      title: "Mix diversificado — hora de ampliar",
      text: `${name}, suplementos já são um diferencial estratégico. Combinando com as categorias certas de higiene e beleza, você pode aumentar o ticket médio da sua farmácia de forma consistente.`,
      highlight: true,
    });
  }

  // Insight 2: categoria de maior oportunidade
  const catMsg: Record<string, { title: string; text: string }> = {
    "Linha Infantil": {
      title: "Linha Infantil: fidelização garantida",
      text: "Produtos infantis têm alta taxa de recompra — clientes voltam todo mês. Uma boa exposição e mix atualizado transforma essa categoria em renda recorrente.",
    },
    "Higiene Bucal": {
      title: "Higiene Bucal: maior giro do Nordeste",
      text: "Higiene bucal tem o maior índice de giro nas farmácias do Piauí e Maranhão. Estar bem abastecido com as marcas certas evita perda de vendas por ruptura.",
    },
    "Capilar": {
      title: "Capilar: margem acima da média",
      text: "A linha capilar tem margem superior à maioria das categorias. Uma boa variedade de marcas e boa exposição pode aumentar o ticket médio com produtos que os clientes já procuram.",
    },
    "Cuidado com a Pele": {
      title: "Cuidados com a Pele: crescimento acelerado",
      text: "Cuidados com a pele é a categoria de maior crescimento no setor. Farmácias que investiram nessa linha aumentaram o faturamento sem depender de prescrições.",
    },
  };

  const destaque = answers.produtos.find((p) => catMsg[p]);
  if (destaque) {
    insights.push({ icon: "🧴", ...catMsg[destaque] });
  }

  // Insight 3: projeção baseada no faturamento mensal
  const projecao: Record<string, { title: string; text: string }> = {
    "Até R$80 mil": {
      title: "Projeção realista para o seu porte",
      text: "Farmácias com perfil similar saíram de R$80 mil para R$110 mil em menos de 6 meses focando nas categorias certas de higiene e beleza.",
    },
    "R$80 mil – R$100 mil": {
      title: "Potencial de crescimento no curto prazo",
      text: "Com os produtos e estratégia certos, farmácias nessa faixa aumentaram o ticket médio em até 25% em 90 dias — sem grandes investimentos.",
    },
    "R$100 mil – R$300 mil": {
      title: "Escala já comprovada no seu nível",
      text: "No seu nível de faturamento, uma estratégia bem executada em higiene pode adicionar de R$20 mil a R$50 mil por mês com as categorias de maior giro.",
    },
    "Acima de 300 mil": {
      title: "Estratégia de crescimento sustentável",
      text: "Para farmácias do seu porte, higiene e beleza é o que separa as que continuam crescendo das que estacionam. O mix certo faz toda a diferença.",
    },
  };

  if (answers.mediaFaturamento && projecao[answers.mediaFaturamento]) {
    insights.push({ icon: "💰", ...projecao[answers.mediaFaturamento] });
  }

  return insights;
}

const Quiz = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    faturamento: "",
    dor: "",
    desempenho: "",
    produtos: [],
    mediaFaturamento: "",
    compraDistribuidora: "",
    estado: "",
    cidade: "",
    nomeFarmacia: "",
    nomeUsuario: "",
    usaRedes: "",
    redesSociais: "",
    nomeCompleto: "",
    email: "",
    cnpj: "",
    telefone: "",
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isSendingSheet, setIsSendingSheet] = useState(false);
  const [sheetSent, setSheetSent] = useState(false);
  const [diagnosisProgress, setDiagnosisProgress] = useState(0);
  const [diagnosisText, setDiagnosisText] = useState(
    "Preparando seu diagnóstico..."
  );

  useEffect(() => {
    trackQuizStep(step);
  }, [step]);

  useEffect(() => {
    if (step !== 8) {
      return;
    }

    const textSteps = [
      "Analisando faturamento e ticket médio...",
      "Verificando desempenho em higiene e beleza...",
      "Entendendo as categorias mais vendidas...",
      "Finalizando seu diagnóstico personalizado...",
    ];

    setDiagnosisProgress(0);
    setDiagnosisText(textSteps[0]);

    let progress = 0;

    const interval = window.setInterval(() => {
      progress += 1;
      setDiagnosisProgress(progress);

      if (progress < 25) setDiagnosisText(textSteps[0]);
      else if (progress < 50) setDiagnosisText(textSteps[1]);
      else if (progress < 75) setDiagnosisText(textSteps[2]);
      else setDiagnosisText(textSteps[3]);

      if (progress >= 100) {
        window.clearInterval(interval);
      }
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, [step]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const setAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const displayName = answers.nomeUsuario || "amigo";

  const toggleProduct = (product: string) => {
    setAnswers((prev) => {
      const current = prev.produtos;

      if (product === "Não trabalho muito esses produtos") {
        return {
          ...prev,
          produtos: current.includes(product) ? [] : [product],
        };
      }

      const filtered = current.filter(
        (p) => p !== "Não trabalho muito esses produtos"
      );

      return {
        ...prev,
        produtos: filtered.includes(product)
          ? filtered.filter((p) => p !== product)
          : [...filtered, product],
      };
    });
  };

  const selectAndNext = (key: keyof Answers, value: string) => {
    setAnswer(key, value as Answers[keyof Answers]);
    setTimeout(next, 350);
  };

  const getLeadName = () => {
    return answers.nomeCompleto || answers.nomeUsuario || displayName;
  };

  const sendSheetData = async () => {
    const leadName = getLeadName();
    const normalizedPhone = answers.telefone.replace(/\D/g, "");
    const normalizedCnpj = answers.cnpj.replace(/\D/g, "");
    const utms = getUTMs();
    const fbclid = getFbclid();

    const sheetsPayload = JSON.stringify({
      nomeCompleto: leadName,
      nome: leadName,
      nomeUsuario: answers.nomeUsuario,
      nomeFarmacia: answers.nomeFarmacia,
      email: answers.email,
      telefone: answers.telefone,
      documento: normalizedCnpj,
      tipoDocumento: "cnpj",
      estado: answers.estado,
      cidade: answers.cidade,
      faturamento: answers.faturamento,
      desempenho: answers.desempenho,
      produtos: answers.produtos,
      mediaFaturamento: answers.mediaFaturamento,
      fbclid,
      ...utms,
    });

    return new Promise<void>((resolve) => {
      const sent = navigator.sendBeacon(
        SHEETS_URL,
        new Blob([sheetsPayload], { type: "text/plain" })
      );

      if (!sent) {
        console.warn("sendBeacon falhou, tentando fetch como fallback");
        fetch(SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: sheetsPayload,
        })
          .catch((error) => {
            console.error("Sheets request error", error);
          })
          .finally(resolve);
      } else {
        resolve();
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
              Descubra como aumentar o faturamento da sua farmácia{" "}
              <span className="text-primary">sem depender de medicamentos</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-md">
              Identifique quais produtos de alto giro podem aumentar seu ticket
              médio e gerar vendas todos os dias
            </p>

            <div className="w-full mt-4">
              <QuizButton onClick={next} variant="cta">
                👉 Fazer diagnóstico gratuito
              </QuizButton>
            </div>
          </div>
        );

      case 2:
        return (
          <QuestionScreen
            emoji="👋"
            question="Qual o seu nome?"
            subtitle="(Como devemos te chamar?)"
          >
            <QuizInput
              value={answers.nomeUsuario}
              onChange={(v) => setAnswer("nomeUsuario", v)}
              placeholder="Digite seu nome"
            />

            <div className="mt-2">
              <QuizButton onClick={next} disabled={!answers.nomeUsuario}>
                Continuar
              </QuizButton>
            </div>
          </QuestionScreen>
        );

      case 3:
        return (
          <QuestionScreen
            emoji="📍"
            question="Onde fica sua farmácia?"
            subtitle="(Selecione o estado e informe a cidade)"
          >
            <div className="flex flex-col gap-3">
              <select
                value={answers.estado}
                onChange={(e) => setAnswer("estado", normalizeState(e.target.value))}
                className="w-full p-4 rounded-lg border-2 border-border bg-card text-foreground font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="" disabled>
                  Selecione o estado
                </option>
                <option value="PI">Piauí (PI)</option>
                <option value="MA">Maranhão (MA)</option>
              </select>

              <QuizInput
                value={answers.cidade}
                onChange={(v) => setAnswer("cidade", v)}
                placeholder="Cidade"
              />
            </div>

            <div className="mt-2">
              <QuizButton
                onClick={next}
                disabled={!answers.estado || !answers.cidade}
              >
                Continuar
              </QuizButton>
            </div>
          </QuestionScreen>
        );

      case 4:
        return (
          <QuestionScreen
            emoji="🧩"
            question={`${displayName}, hoje, o que mais gera faturamento na sua farmácia?`}
          >
            {[
              "Medicamentos",
              "Perfumaria e higiene",
              "Suplementos"
            ].map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.faturamento === opt}
                onClick={() => selectAndNext("faturamento", opt)}
              />
            ))}
          </QuestionScreen>
        );

      case 5:
        return (
          <QuestionScreen
            emoji="💡"
            question={`${displayName}, como está o desempenho da sua linha de higiene e beleza?`}
          >
            {[
              "Vende muito bem",
              "Poderia melhorar",
              "Vendo pouco",
            ].map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.desempenho === opt}
                onClick={() => selectAndNext("desempenho", opt)}
              />
            ))}
          </QuestionScreen>
        );

      case 6:
        return (
          <QuestionScreen
            emoji="🧴"
            question={`Quais dessas categorias você mais trabalha, ${displayName}?`}
            subtitle="(Pode selecionar mais de uma opção)"
          >
            {[
              "Linha Infantil",
              "Higiene Bucal",
              "Capilar",
              "Cuidado com a Pele"
            ].map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.produtos.includes(opt)}
                onClick={() => toggleProduct(opt)}
                multiSelect
              />
            ))}

            <div className="mt-2">
              <QuizButton onClick={next} disabled={answers.produtos.length === 0}>
                Continuar
              </QuizButton>
            </div>
          </QuestionScreen>
        );

      case 7:
        return (
          <QuestionScreen
            emoji="💰"
            question={`E qual a média de faturamento mensal da sua farmácia, ${displayName}?`}
          >
            {[
              "Até R$80 mil",
              "R$80 mil – R$100 mil",
              "R$100 mil – R$300 mil",
              "Acima de 300 mil"
            ].map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.mediaFaturamento === opt}
                onClick={() => selectAndNext("mediaFaturamento", opt)}
              />
            ))}
          </QuestionScreen>
        );

      case 8:
        return (
          <div className="flex flex-col items-center text-center gap-5 py-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                Gerando seu diagnóstico
              </h2>
              <p className="text-primary font-semibold text-base">
                personalizado para você
              </p>
            </div>

            <p className="text-muted-foreground text-sm max-w-sm">
              Estamos cruzando suas respostas para identificar as melhores
              oportunidades para a sua farmácia.
            </p>

            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-sm text-muted-foreground">{diagnosisText}</p>
                <span className="text-base font-bold text-primary tabular-nums">
                  {diagnosisProgress}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-border overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
                  initial={{ width: "0%" }}
                  animate={{ width: `${diagnosisProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {diagnosisProgress < 100 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {diagnosisProgress === 100 && (
              <motion.div
                className="w-full max-w-md text-left space-y-2 pt-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-foreground font-bold text-lg">
                  ✅ Diagnóstico concluído!
                </p>
                <p className="text-muted-foreground text-sm">
                  Preencha o formulário com seus dados para ter acesso ao
                  resultado completo.
                </p>
                <div className="pt-2">
                  <QuizButton onClick={next} variant="cta">
                    Continuar
                  </QuizButton>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col gap-5 py-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                Seu diagnóstico está pronto!
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Preencha os dados abaixo para liberar o resultado personalizado
                da sua farmácia.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <QuizInput
                value={answers.nomeCompleto}
                onChange={(v) => setAnswer("nomeCompleto", v)}
                placeholder="Nome completo"
              />
              <QuizInput
                value={answers.telefone}
                onChange={(v) => setAnswer("telefone", v)}
                placeholder="WhatsApp (00) 00000-0000"
                mask="phone"
              />
              <QuizInput
                value={answers.email}
                onChange={(v) => setAnswer("email", v.trim().toLowerCase())}
                placeholder="E-mail"
                type="email"
              />
              {answers.email && !isValidEmail(answers.email) && (
                <p className="text-sm text-destructive -mt-1">
                  Informe um e-mail válido.
                </p>
              )}
              <QuizInput
                value={answers.cnpj}
                onChange={(v) => setAnswer("cnpj", v)}
                placeholder="CNPJ 00.000.000/0000-00"
                mask="cnpj"
              />
            </div>

            <QuizButton
              onClick={async () => {
                if (isSendingSheet) {
                  return;
                }

                setIsSendingSheet(true);
                await sendSheetData();
                setSheetSent(true);
                setIsSendingSheet(false);
                next();
              }}
              disabled={
                answers.telefone.length < 14 ||
                !isValidEmail(answers.email) ||
                !validarCNPJ(answers.cnpj)
              }
              variant="cta"
            >
              {isSendingSheet ? "Enviando dados..." : "Liberar meu diagnóstico"}
            </QuizButton>
          </div>
        );

      case 10: {
        const leadName = getLeadName();
        const firstName = leadName.split(" ")[0] || displayName;
        const insights = getDiagnosisInsights(answers, firstName);

        return (
          <div className="flex flex-col gap-5 py-4">
            {/* Cabeçalho */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Diagnóstico personalizado
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                {firstName}, identificamos{" "}
                <span className="text-primary">
                  {insights.length} oportunidade{insights.length !== 1 ? "s" : ""}
                </span>{" "}
                na sua farmácia
              </h2>
            </div>

            {/* Cards de insights */}
            <div className="flex flex-col gap-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-l-4 bg-card ${
                    insight.highlight ? "border-l-primary" : "border-l-secondary"
                  }`}
                >
                  <p className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span>{insight.icon}</span>
                    {insight.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 pt-1">
              <p className="text-sm text-muted-foreground text-center">
                Nossos especialistas já ajudaram dezenas de farmácias com este
                perfil. Fale agora e receba uma sugestão de mix personalizada.
              </p>

              <QuizButton
                onClick={async () => {
                if (isSubmittingLead) {
                  return;
                }

                setIsSubmittingLead(true);

                const utms = getUTMs();
                const fbclid = getFbclid();
                const normalizedPhone = answers.telefone.replace(/\D/g, "");
                const normalizedCnpj = answers.cnpj.replace(/\D/g, "");
                const leadName = getLeadName();

                try {
                  fbq("track", "Lead");
                } catch (_) {
                  // pixel pode não estar carregado
                }

                const crmPromise = fetch(CRM_URL, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    leadCaptureKey: LEAD_CAPTURE_KEY,
                    name: leadName,
                    phone: normalizedPhone,
                    document: normalizedCnpj,
                    documentType: "cnpj",
                    utm_source: utms.utm_source,
                    utm_medium: utms.utm_medium,
                    utm_campaign: utms.utm_campaign,
                    utm_content: utms.utm_content,
                    utm_term: utms.utm_term,
                    fbclid,
                  }),
                })
                  .then(async (response) => {
                    const crmData = await response.json().catch(() => null);

                    if (!response.ok) {
                      console.error("CRM lead capture failed", {
                        status: response.status,
                        response: crmData,
                      });
                    } else if (crmData?.duplicate) {
                      console.warn("CRM lead already exists", crmData);
                    } else {
                      console.info("CRM lead created successfully", crmData);
                    }
                  })
                  .catch((error) => {
                    console.error("CRM lead capture request error", error);
                  });

                if (!sheetSent) {
                  await sendSheetData();
                  setSheetSent(true);
                }

                await Promise.allSettled([crmPromise]);

                const phone = WHATSAPP_NUMBER;
                const msg = encodeURIComponent(
                  `Olá! Fiz o diagnóstico no site e gostaria de falar com um especialista.\n\n` +
                    `Nome: ${leadName}\n` +
                    `Telefone: ${answers.telefone}\n` +
                    `CNPJ: ${answers.cnpj}`
                );
                window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                setIsSubmittingLead(false);
              }}
              disabled={isSubmittingLead}
              variant="cta"
            >
              <span className="flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {isSubmittingLead
                  ? "Enviando seus dados..."
                  : "Falar com um especialista agora"}
              </span>
            </QuizButton>
          </div>
        </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <WaveDecoration />

      <div className="w-full bg-primary py-5 px-6 flex items-center justify-between relative shadow-md">
        <div className="w-[60px] flex justify-start">
          {step > 1 && step < 7 && (
            <button
              onClick={prev}
              className="text-primary-foreground text-sm font-medium"
              type="button"
            >
              ← Voltar
            </button>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          <img src={logo} alt="RIO PIRANHAS" className="h-7 w-auto" />
          <span className="text-primary-foreground font-bold text-lg tracking-wide whitespace-nowrap">
            RIO PIRANHAS
          </span>
        </div>

        <div className="w-[60px]" />
      </div>

      {step > 1 && step < TOTAL_STEPS && (
        <ProgressBar current={step - 1} total={TOTAL_STEPS - 1} />
      )}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const QuestionScreen = ({
  emoji,
  question,
  subtitle,
  children,
}: {
  emoji: string;
  question: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start gap-3">
      <span className="text-2xl">{emoji}</span>

      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {question}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>

    <div className="flex flex-col gap-3 mt-2">{children}</div>
  </div>
);

export default Quiz;
