import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, DollarSign, MousePointerClick, Eye, Target, ArrowRight, CheckCircle, MessageCircle, Mail } from 'lucide-react';
import { MetaIcon, GoogleIcon, TikTokIcon } from '@/components/icons/PlatformIcons';
const features = [{
  icon: <DollarSign className="w-6 h-6" />,
  title: 'Investimento',
  description: 'Acompanhe quanto está sendo investido em cada plataforma'
}, {
  icon: <Target className="w-6 h-6" />,
  title: 'Leads e Conversões',
  description: 'Visualize quantos leads e conversões suas campanhas geraram'
}, {
  icon: <MousePointerClick className="w-6 h-6" />,
  title: 'Cliques e CTR',
  description: 'Monitore a taxa de cliques e engajamento dos anúncios'
}, {
  icon: <Eye className="w-6 h-6" />,
  title: 'Impressões',
  description: 'Veja o alcance total das suas campanhas publicitárias'
}];
const platforms = [{
  icon: <MetaIcon size={32} className="text-[hsl(214,100%,45%)]" />,
  name: 'Instagram/Meta'
}, {
  icon: <GoogleIcon size={32} />,
  name: 'Google Ads'
}, {
  icon: <TikTokIcon size={32} className="text-[hsl(180,76%,48%)]" />,
  name: 'TikTok Ads'
}];
const Landing: React.FC = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={18} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Racun Analytics</span>
          </div>
          <Link to="/login">
            <Button>
              Entrar no painel
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-in">
              <TrendingUp size={16} />
              Tráfego Pago Simplificado
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Acompanhe seus resultados{' '}
              <span className="gradient-text">em um só lugar</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 animate-slide-up" style={{
            animationDelay: '0.1s'
          }}>
              Visualize o desempenho das suas campanhas de Instagram, Google e TikTok
              em um painel unificado, fácil e intuitivo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Entrar no painel
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8">
            Dados unificados das principais plataformas
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {platforms.map(platform => <div key={platform.name} className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                {platform.icon}
                <span className="text-foreground font-medium">{platform.name}</span>
              </div>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que você vai acompanhar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todas as métricas importantes para entender o desempenho das suas campanhas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <div key={feature.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 text-center">
              Por que usar nosso portal?
            </h2>
            
            <div className="space-y-4">
              {['Dados atualizados das suas campanhas em tempo real', 'Comparativo entre períodos para análise de evolução', 'Relatórios exportáveis em PDF e CSV', 'Acesso seguro exclusivo para cada cliente', 'Visualização simplificada de métricas complexas'].map((benefit, index) => <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                  <CheckCircle size={20} className="text-success flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Pronto para acompanhar seus resultados?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Acesse o painel com seu login e senha fornecidos pelo seu gestor de tráfego.
            </p>
            <Link to="/login">
              <Button size="lg" className="text-lg px-8">
                Acessar meu painel
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <BarChart3 size={14} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Racun Analytics</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" href="https://wa.me/554732096098">
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" href="racunagencia@gmail.com">
                <Mail size={16} />
                E-mail
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Versão 1.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;