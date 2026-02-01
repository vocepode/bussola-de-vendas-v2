CREATE TABLE `contentIdeas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`theme` varchar(255),
	`topic` enum('dicas','principais_desejos','perguntas_comuns','mitos','historias','erros_comuns','feedbacks','diferencial_marca','nossos_produtos') NOT NULL,
	`funnel` enum('c1','c2','c3') NOT NULL,
	`format` enum('video_curto','video','carrossel','imagem','estatico','live','stories') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentIdeas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentScripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentIdeaId` int NOT NULL,
	`userId` int NOT NULL,
	`deadlinePlanning` timestamp,
	`strategy` enum('vendas','atracao','autoridade','branding'),
	`ladderingAttributes` json,
	`ladderingFunctionalBenefits` json,
	`ladderingEmotionalBenefits` json,
	`funnelGoal` enum('seguidores','branding','leads','venda','autoridade','quebrar_objecao','inspirar','gerar_leads','prova_social'),
	`progressStatus` enum('ideia','a_fazer','planejando_roteiro','gravacao','design','aprovacao','programado','publicado') NOT NULL DEFAULT 'ideia',
	`platforms` json,
	`deadlineContent` timestamp,
	`postDate` timestamp,
	`postLink` varchar(500),
	`scriptFields` json,
	`evaluationGood` text,
	`evaluationBad` text,
	`references` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentScripts_id` PRIMARY KEY(`id`)
);
