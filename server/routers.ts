import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addLeaderParticipant, createRegistration, deleteLeaderParticipant, getLeader, isLeaderCode, listEvents, updateLeader, updateLeaderParticipant } from "./db";

const ACCESS_CODE = "鍘美搶桌大行動";
const leaderCode = z.string().trim().regex(/^(921|922a|922b)$/, "桌長驗證碼不正確");
function requireLeader(code:string){ if(!isLeaderCode(code)) throw new TRPCError({code:"UNAUTHORIZED",message:"桌長驗證碼不正確"}); }

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions=getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME,{...cookieOptions,maxAge:-1}); return {success:true} as const; }),
  }),
  access: router({ verify: publicProcedure.input(z.object({code:z.string().max(80)})).mutation(({input})=>({verified:input.code.trim()===ACCESS_CODE})) }),
  leaders: router({
    login: publicProcedure.input(z.object({code:leaderCode})).mutation(async({input})=>{const leader=await getLeader(input.code);return {verified:!!leader,leader};}),
    get: publicProcedure.input(z.object({code:leaderCode})).query(async({input})=>{const leader=await getLeader(input.code);if(!leader)throw new TRPCError({code:"UNAUTHORIZED",message:"桌長驗證碼不正確"});return leader;}),
    update: publicProcedure.input(z.object({code:leaderCode,name:z.string().trim().min(1).max(120),people:z.number().int().min(1).max(10)})).mutation(async({input})=>{requireLeader(input.code);const result=await updateLeader(input.code,input.name,input.people);if(!result)throw new TRPCError({code:"UNAUTHORIZED",message:"桌長驗證碼不正確"});if("kind" in result&&result.kind==="invalid")throw new TRPCError({code:"BAD_REQUEST",message:`參與人數至少要 ${result.minPeople} 人（包含桌長自己）`});if("kind" in result&&result.kind==="full")throw new TRPCError({code:"CONFLICT",message:`名額不足，目前只剩 ${result.remaining} 個名額`});return result;}),
    addParticipant: publicProcedure.input(z.object({code:leaderCode,name:z.string().trim().min(1).max(120),people:z.number().int().min(1).max(10)})).mutation(async({input})=>{const result=await addLeaderParticipant(input.code,input.name,input.people);if(!result)throw new TRPCError({code:"UNAUTHORIZED",message:"桌長驗證碼不正確"});if("kind" in result&&result.kind==="full")throw new TRPCError({code:"CONFLICT",message:`名額不足，目前只剩 ${result.remaining} 個名額`});return result;}),
    updateParticipant: publicProcedure.input(z.object({code:leaderCode,registrationId:z.number().int().positive(),people:z.number().int().min(1).max(10)})).mutation(async({input})=>{const result=await updateLeaderParticipant(input.code,input.registrationId,input.people);if(!result)throw new TRPCError({code:"NOT_FOUND",message:"找不到參與者"});if("kind" in result&&result.kind==="full")throw new TRPCError({code:"CONFLICT",message:`名額不足，目前只剩 ${result.remaining} 個名額`});return result;}),
    deleteParticipant: publicProcedure.input(z.object({code:leaderCode,registrationId:z.number().int().positive()})).mutation(async({input})=>{const result=await deleteLeaderParticipant(input.code,input.registrationId);if(!result)throw new TRPCError({code:"NOT_FOUND",message:"找不到參與者"});return result;}),
  }),
  events: router({ list: publicProcedure.query(()=>listEvents()) }),
  registrations: router({ create: publicProcedure.input(z.object({eventSlug:z.string().min(1).max(32),name:z.string().trim().min(1,"請輸入名字").max(120),people:z.number().int().min(1,"至少登記 1 人").max(10,"單次最多 10 人")})).mutation(async({input})=>{const result=await createRegistration(input.eventSlug,input.name,input.people);if(result.kind==="not_found")throw new TRPCError({code:"NOT_FOUND",message:"找不到這場活動"});if(result.kind==="full")throw new TRPCError({code:"CONFLICT",message:`名額不足，目前只剩 ${result.remaining} 個名額`});return result;}) }),
});
export type AppRouter=typeof appRouter;
